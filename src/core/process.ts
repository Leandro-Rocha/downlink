import { Streamer, NetworkInterface, Stream } from "./network-interfaces"
import { ISignalEmitter, signalEmitter, SIGNALS } from "./signal"
import { Player } from "./player"

export enum Status {
    NEW = 'NEW',
    RUNNING = 'RUNNING',
    FINISHED = 'FINISHED',
    DEAD = 'DEAD'
}

function pidGenerator(player: Player) {
    return `${player.name}_${Date.now()}`
}

@signalEmitter
export class Process {
    static MIN_PRIORITY = 0
    static MAX_PRIORITY = 10

    private _pid: string
    private _priority: number
    status: Status

    constructor(pid: string) {
        this._pid = pid
        this._priority = (Process.MIN_PRIORITY + Process.MAX_PRIORITY) / 2

        this.status = Status.NEW
    }

    get pid() {
        return this._pid
    }

    get priority() {
        return this._priority
    }

    set priority(newPriority: number) {
        this._priority = newPriority
        this.sendSignal(this, SIGNALS.PROCESS_PRIORITY_CHANGED, newPriority)
    }

    lowerPriority() {
        if (this._priority > Process.MIN_PRIORITY)
            this._priority--
    }

    raisePriority() {
        if (this._priority < Process.MAX_PRIORITY)
            this._priority++
    }
}
export interface Process extends ISignalEmitter { }

export class StreamerProcess extends Process implements Streamer {
    networkInterface: NetworkInterface
    stream!: Stream
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

    constructor(pid: string, networkInterface: NetworkInterface) {
        super(pid)

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