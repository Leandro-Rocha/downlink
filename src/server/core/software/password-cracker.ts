import { ROOT, SoftwareTypes } from "../../../common/constants"
import { EntityType, Gui } from "../../../common/types"
import { OperationResult } from "../../../shared"
import { getCurrentPlayer } from "../game-state"
import { Player } from "../owner"
import { WorkerProcess, WorkerProcessConstructor } from "../process"
import { signalEmitter, SIGNALS } from "../signal"
import { Software, SpawnProcessResult } from "./software"
import faker from "faker";

export class PasswordCracker extends Software {
    version: number

    constructor(config?: Partial<Gui.Software>) {
        super(config)

        this.version = config?.version || 1.0
        this.name = config?.name || `PasswordCracker[${this.version}]`
        this.guiId = config?.guiId || `${this.name}_${Date.now()}`
        this.size = config?.size || 1000
    }


    spawnProcess(ip: string, userName: string) {
        const result = new OperationResult<SpawnProcessResult>()

        const targetUserName = userName || ROOT
        const player: Player = getCurrentPlayer()

        const remoteGateway = player.gateway.outboundConnection?.gateway!
        result.assert(remoteGateway !== undefined, `Not connected to a remote gateway.`)
        if (!result.isSuccessful()) return result

        const targetUser = remoteGateway.users.find(u => u.userName === targetUserName)!
        result.assert(targetUser !== undefined, `User [${userName}] does not exists in this gateway.`)
        if (!result.isSuccessful()) return result

        result.assert(!targetUser.partial, `Password for user [${userName}] is already known.`)
        if (!result.isSuccessful()) return result

        const addEntryResult = player.hackedDB.addEntry(remoteGateway, { userName: targetUserName, password: '', partial: true })
        const entry = addEntryResult.details.entry

        const userToHack = entry.users.find(u => u.userName === targetUserName)
        //TODO: implement dynamic parameters based on password strength
        const process = new PasswordCrackerProcess({
            totalWork: 5000,
            userToHack: userToHack!,
            password: targetUser.password
        })


        result.details = { process: process }
        return result
    }

    toClient(): Partial<Gui.File> {
        return <Partial<Gui.File>>{
            ...super.toClient()
        }
    }
}


interface PasswordCrackerProcessConstructor extends WorkerProcessConstructor { password: string, userToHack: Gui.User }
@signalEmitter
export class PasswordCrackerProcess extends WorkerProcess {
    entityType: EntityType = EntityType.PROCESS_CRACKER
    description: string

    password: string
    userToHack: Gui.User
    private interval!: NodeJS.Timeout

    constructor(config: PasswordCrackerProcessConstructor) {
        super(config)

        this.password = config.password
        this.userToHack = config.userToHack

        this.description = `Breaking password of user [${this.userToHack.userName}]`
    }

    start() {
        super.start()
        const targetPassword = this.password
        const interval = this.totalWork / targetPassword.length

        var cracked = 0

        this.interval = setInterval(() => {
            this.checkStatus()
            cracked++
            this.userToHack.password = targetPassword.substr(0, cracked) + faker.random.alphaNumeric(targetPassword.length - cracked)
            this.sendSignal(this, SIGNALS.PROCESS_UPDATED)

            if (cracked >= targetPassword.length) {
                this.finish()
            }

        }, interval)
    }

    finish() {
        clearInterval(this.interval)
        super.finish()
    }
}