import { ISignalEmitter, signalEmitter, SIGNALS } from "./signal"
import { EntityType, GameEntity, GuiElementId, Presentable, Gui } from '../../common/types'
import { ProcessStatus, ROOT } from "../../common/constants"
import { OperationResult } from "../../shared"

function pidGenerator(userName: string) {
    return `${userName}_${Date.now()}`
}

interface ProcessConstructor { userName?: string, pid?: string, priority?: number, status?: ProcessStatus }
export interface Process extends ISignalEmitter { }

export abstract class Process implements GameEntity, Presentable<Gui.Process> {
    static MIN_PRIORITY = 0
    static MAX_PRIORITY = 10

    abstract entityType: EntityType
    abstract description: string

    readonly pid: string
    userName: string
    status: ProcessStatus

    _priority: number

    constructor(config: ProcessConstructor) {
        this.userName = config.userName || ROOT
        this.pid = config.pid || pidGenerator(this.userName)
        this._priority = config.priority || (Process.MIN_PRIORITY + Process.MAX_PRIORITY) / 2
        this.status = config.status || ProcessStatus.NEW
    }


    toClient(): GuiElementId & Partial<Process> {
        return {
            guiId: this.pid,
            entityType: this.entityType,

            userName: this.userName,
            status: this.status,
            priority: this.priority,
            description: this.description,
        }
    }

    get priority() {
        return this._priority
    }

    setPriority(newPriority: number) {
        const result = new OperationResult()

        result.assert(newPriority <= Process.MAX_PRIORITY && newPriority >= Process.MIN_PRIORITY, `Invalid priority [${newPriority}]`)
        if (!result.isSuccessful()) return result

        this._priority = newPriority
        this.sendSignal(this, SIGNALS.PROCESS_PRIORITY_CHANGED, newPriority)
    }

    start() {
        console.log(`Process [${this.pid}] started`)
        this.status = ProcessStatus.RUNNING
        this.sendSignal(this, SIGNALS.PROCESS_STARTED)
    }

    finish() {
        console.log(`Process [${this.pid}] finished`)
        this.status = ProcessStatus.FINISHED
        this.sendSignal(this, SIGNALS.PROCESS_FINISHED)
    }


}

export interface StreamerProcess extends ISignalEmitter { }

// TODO: refactor download logic
@signalEmitter
export class StreamerProcess extends Process {
    entityType: EntityType = EntityType.PROCESS_TRANSFER
    description: string = 'File transfer'

    networkInterface: Gui.INetworkInterface
    stream!: Gui.Stream
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

    constructor(networkInterface: Gui.INetworkInterface) {
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

export interface WorkerProcessConstructor extends ProcessConstructor { totalWork: number, workDone?: number }
export abstract class WorkerProcess extends Process implements Presentable<Gui.WorkerProcess>{
    totalWork: number
    workDone: number

    private timeout!: NodeJS.Timeout
    private lastUpdate: number

    constructor(config: WorkerProcessConstructor) {
        super(config)
        this.totalWork = config.totalWork
        this.workDone = config.workDone || 0

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

    toClient() {
        return {
            ...super.toClient(),
            totalWork: this.totalWork,
            workDone: this.workDone <= this.totalWork ? this.workDone : this.totalWork
        }
    }
}


// Run Tracer - Constant running process
// Run Anti-Virus - Process with work to do
// Connect to server - Instant action
// Download file - Multi resource process