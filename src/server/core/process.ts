import { ISignalEmitter, signalEmitter, SIGNALS } from "./signal"
import { Presentable, Types } from '../../common/types'
import { ProcessStatus, ROOT } from "../../common/constants"
import { OperationResult } from "../../shared"
import { File } from "./resource"
import { Player } from "./owner"
import { getCurrentPlayer as getCurrentPlayer } from "./game-state"

import faker from 'faker'


function pidGenerator(userName: string) {
    return `${userName}_${Date.now()}`
}


export interface Process extends ISignalEmitter { }
export abstract class Process implements Types.Process, Presentable<Process> {
    static MIN_PRIORITY = 0
    static MAX_PRIORITY = 10

    readonly pid: string
    userName: string
    status: ProcessStatus
    description: string
    _priority: number

    type: any

    constructor(config?: Partial<Types.Process>) {
        this.userName = config?.userName || 'root'
        this.pid = config?.pid || pidGenerator(this.userName)
        this._priority = config?.priority || (Process.MIN_PRIORITY + Process.MAX_PRIORITY) / 2
        this.status = config?.status || ProcessStatus.NEW
        this.description = config?.description || 'unknown_process'
    }

    get priority() {
        return this._priority
    }

    setPriority(newPriority: number) {
        const result = new OperationResult()

        result.validate(newPriority <= Process.MAX_PRIORITY && newPriority >= Process.MIN_PRIORITY, `Invalid priority [${newPriority}]`)
        if (!result.isSuccessful()) return result

        this._priority = newPriority
        this.sendSignal(this, SIGNALS.PROCESS_PRIORITY_CHANGED, newPriority)
    }

    start() {
        console.debug(`Process [${this.pid}] started`)
        this.status = ProcessStatus.RUNNING
        this.sendSignal(this, SIGNALS.PROCESS_STARTED)
    }

    finish() {
        console.debug(`Process [${this.pid}] finished`)
        this.status = ProcessStatus.FINISHED
        this.sendSignal(this, SIGNALS.PROCESS_FINISHED)
    }

    toClient(): Partial<Process> {
        return <Partial<Process>>{
            pid: this.pid,
            userName: this.userName,
            status: this.status,
            priority: this.priority,
            description: this.description,
        }
    }
}

// TODO: refactor download logic
@signalEmitter
export class StreamerProcess extends Process implements Types.StreamerProcess {
    networkInterface: Types.INetworkInterface
    stream!: Types.Stream
    priorityRatio!: number
    fairBandwidth!: number

    private _bandWidth: number
    get bandWidth(): number {
        return this._bandWidth
    }

    /**
     * Limited to use its full capacity by its pair
     */
    isBounded: boolean

    constructor(networkInterface: Types.INetworkInterface) {
        super({ userName: 'REFACTOR_ME_PLEASE' })

        this.networkInterface = networkInterface
        this._bandWidth = 0
        this.isBounded = false
    }

    updateBandwidth(amount: number) {
        const bandWidthChanged = this._bandWidth !== amount
        this._bandWidth = amount

        const maxAllocation = this.getMaxBandwidth()
        const unused = maxAllocation - amount

        if (unused > 0) {
            this.isBounded = true
        }
        else {
            this.isBounded = false
        }

        return bandWidthChanged
    }

    getMaxBandwidth(): number {
        // TODO check if running
        return this.networkInterface.getProcessMaxAllocation(this)
    }
}


export abstract class WorkerProcess extends Process implements Types.WorkerProcess, Presentable<Types.WorkerProcess>{
    totalWork: number
    workDone: number

    private timeout!: NodeJS.Timeout
    private lastUpdate: number

    constructor(config?: Partial<Types.WorkerProcess> & Partial<Types.Process>) {
        super(config)
        this.totalWork = config?.totalWork || 0
        this.workDone = config?.workDone || 0

        this.lastUpdate = 0
    }

    start() {
        this.lastUpdate = Date.now()
        // this.timeout = setTimeout(() => this.finish(), this.totalWork - this.workDone)
        super.start()
    }

    finish() {
        const elapsedTime = Date.now() - this.lastUpdate
        this.doWork!(elapsedTime)
        super.finish()
    }

    checkStatus() {
        // clearTimeout(this.timeout)
        const now = Date.now()
        const elapsedTime = now - this.lastUpdate

        this.lastUpdate = now
        this.workDone += elapsedTime

        // this.timeout = setTimeout(() => this.finish(), this.totalWork - this.workDone)
    }

    doWork(elapsedTime: number): void {
        this.workDone += elapsedTime
    }

    toClient(): Partial<Types.PasswordCrackerProcess> {
        return <Partial<Types.PasswordCrackerProcess>>{
            ...super.toClient(),
            totalWork: this.totalWork,
            workDone: this.workDone <= this.totalWork ? this.workDone : this.totalWork

        }
    }
}

@signalEmitter
export class PasswordCrackerProcess extends WorkerProcess {
    targetUser: Types.User
    interval!: NodeJS.Timeout

    constructor(config: Partial<Types.PasswordCrackerProcess> & { targetUser: Types.User }) {
        super(config)

        this.targetUser = config?.targetUser
    }

    start() {
        super.start()
        const targetPassword = this.targetUser.password
        const interval = this.totalWork / targetPassword.length

        var cracked = 0

        this.interval = setInterval(() => {
            this.checkStatus()
            cracked++
            this.targetUser.password = targetPassword.substr(0, cracked) + faker.random.alphaNumeric(targetPassword.length - cracked)
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

type SpawnProcessResult = { process: Process }
export abstract class Software extends File implements Types.Software {
    abstract version: number
    abstract spawnProcess(...args: any[]): OperationResult<SpawnProcessResult>
}

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
        const targetUserName = userName || ROOT

        const player: Player = getCurrentPlayer()



        const result = new OperationResult<SpawnProcessResult>()

        const remoteGateway = player.gateway.outboundConnection.gateway!
        const targetUser = remoteGateway.users.find(u => u.userName === targetUserName)!

        result.validate(targetUser !== undefined, 'User does not exists in this gateway.')
        if (!result.isSuccessful()) return result

        const entry = player.hackedDB.addEntry(remoteGateway, targetUser)

        //TODO: implement dynamic parameters
        const process = new PasswordCrackerProcess({ totalWork: 5000, targetUser: entry.users.find(u => u.userName === targetUserName)! })


        result.details = { process: process }
        return result
    }

    toClient(): Partial<Types.File> {
        return <Partial<Types.File>>{
            ...super.toClient()
        }
    }
}

// Run Tracer - Constant running process
// Run Anti-Virus - Process with work to do
// Connect to server - Instant action
// Download file - Multi resource process