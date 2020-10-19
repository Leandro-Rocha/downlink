import { EntityType, Gui } from "../../../common/types"
import { getCurrentPlayer } from "../game-state"
import { WorkerProcess, WorkerProcessConstructor } from "../process"
import { signalEmitter, SIGNALS } from "../signal"
import { Software } from "./software"
import { Player } from "../player/player"
import { Validator } from "../../../shared"

export class PasswordCracker extends Software {
    entityType = EntityType.SOFTWARE_CRACKER
    version: number
   
    type: string = 'cracker'

    constructor(config?: Partial<Software>) {
        super(config)

        this.version = config?.version || 1.0
        this.name = config?.name || `PasswordCracker[v${this.version}]`
        this.size = config?.size || 1000
    }


    spawnProcess() {
        const player: Player = getCurrentPlayer()

        const remoteGateway = player.gateway.outboundConnection?.gateway!
        Validator.assert(remoteGateway !== undefined, `Not connected to a remote gateway.`)

        const existingEntry = player.hackedDB.getEntryByIp(remoteGateway.ip)!
        Validator.assert(existingEntry !== undefined && existingEntry.user.partial, `Password for [${remoteGateway.ip}] is already known.`)

        //TODO: implement dynamic parameters based on password strength
        const process = new PasswordCrackerProcess({
            totalWork: 10000 / this.version,
            userToHack: existingEntry.user,
            password: remoteGateway.users[0].password
        })

        return process
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
                this.userToHack.partial = false
                this.finish()
            }

        }, interval)
    }

    finish() {
        clearInterval(this.interval)
        super.finish()

    }
}