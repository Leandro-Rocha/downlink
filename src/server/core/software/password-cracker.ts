import { ROOT } from "../../../common/constants"
import { Types } from "../../../common/types"
import { OperationResult } from "../../../shared"
import { getCurrentPlayer } from "../game-state"
import { Player } from "../owner"
import { WorkerProcess } from "../process"
import { signalEmitter, SIGNALS } from "../signal"
import { Software, SpawnProcessResult } from "./software"
import faker from "faker";
import { HackedDbEntry } from "../player/hacked-db"

export class PasswordCracker extends Software {
    version: number

    constructor(config?: Partial<Types.Software>) {
        super(config)

        this.version = config?.version || 1.0
        this.name = config?.name || `PasswordCracker[${this.version}]`
        this.id = config?.id || `${this.name}_${Date.now()}`
        this.size = config?.size || 1000
    }


    spawnProcess(ip: string, userName: string) {
        const result = new OperationResult<SpawnProcessResult>()

        const targetUserName = userName || ROOT
        const player: Player = getCurrentPlayer()

        const remoteGateway = player.gateway.outboundConnection.gateway!
        const targetUser = remoteGateway.users.find(u => u.userName === targetUserName)!

        result.validate(targetUser !== undefined, `User [${userName}] does not exists in this gateway.`)
        if (!result.isSuccessful()) return result

        result.validate(!targetUser.partial, `Password for user [${userName}] is already known.`)
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

    toClient(): Partial<Types.File> {
        return <Partial<Types.File>>{
            ...super.toClient()
        }
    }
}


@signalEmitter
export class PasswordCrackerProcess extends WorkerProcess {
    password: string
    userToHack: Types.User
    private interval!: NodeJS.Timeout

    constructor(config: Partial<PasswordCrackerProcess> & { password: string, userToHack: Types.User }) {
        super(config)

        this.password = config.password
        this.userToHack = config.userToHack
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