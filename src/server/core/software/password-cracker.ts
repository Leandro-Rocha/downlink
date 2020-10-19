import { ROOT } from "../../../common/constants"
import { EntityType, Gui } from "../../../common/types"
import { OperationResult, Validator } from "../../../shared"
import { getCurrentPlayer } from "../game-state"
import { WorkerProcess, WorkerProcessConstructor } from "../process"
import { signalEmitter, SIGNALS } from "../signal"
import { Software, SpawnProcessResult } from "./software"
import faker from "faker";
import { Player } from "../player/player"

export class PasswordCracker extends Software {
    entityType = EntityType.SOFTWARE_CRACKER
    version: number

    constructor(config?: Partial<Software>) {
        super(config)

        this.version = config?.version || 1.0
        this.name = config?.name || `PasswordCracker[v${this.version}]`
        this.size = config?.size || 1000
    }


    spawnProcess(ip: string, userName: string) {
        const result = new OperationResult<SpawnProcessResult>()

        const targetUserName = userName || ROOT
        const player: Player = getCurrentPlayer()

        const remoteGateway = player.gateway.outboundConnection?.gateway!
        Validator.assert(remoteGateway !== undefined, `Not connected to a remote gateway.`)
        if (!result.isSuccessful()) return result

        const targetUser = remoteGateway.users.find(u => u.userName === targetUserName)!
        result.assert(targetUser !== undefined, `User [${userName}] does not exists in this gateway.`)
        if (!result.isSuccessful()) return result

        result.assert(!targetUser.partial, `Password for user [${userName}] is already known.`)
        if (!result.isSuccessful()) return result

        const addEntryResult = player.hackedDB.addEntry(remoteGateway, { userName: targetUserName, password: '', partial: true })
        const entry = addEntryResult.details.entry

        //TODO: implement dynamic parameters based on password strength
        const process = new PasswordCrackerProcess({
            totalWork: 5000,
            userToHack: entry.user,
            password: targetUser.password
        })


        result.details = { process: process }
        return result
    }
}


interface PasswordCrackerProcessConstructor extends WorkerProcessConstructor { password: string, userToHack: Gui.User }
@signalEmitter
export class PasswordCrackerProcess extends WorkerProcess {
    id: string
    entityType: EntityType = EntityType.PROCESS_CRACKER
    shortName: string
    description: string

    password: string
    userToHack: Gui.User
    private interval!: NodeJS.Timeout

    constructor(config: PasswordCrackerProcessConstructor) {
        super(config)

        this.password = config.password
        this.userToHack = config.userToHack

        this.shortName = 'CRCKR'
        this.description = `Breaking password of user [${this.userToHack.userName}]`


        this.id = config.id || this.pidGenerator()
    }

    start() {
        super.start()
        const targetPassword = this.password
        const interval = this.totalWork / targetPassword.length

        var cracked = 0

        this.interval = setInterval(() => {
            this.checkStatus()
            cracked++
            this.userToHack.password = targetPassword.substr(0, cracked)
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