import { Streamer, NetworkInterface, Stream } from "../network-interfaces"
import { ISignalEmitter, SignalEmitter } from "../signal"
import { applyMixins } from "../shared"

export class Process implements Process {
    static MIN_PRIORITY = 0
    static MAX_PRIORITY = 10

    pid: string
    priority: number

    constructor(pid: string) {
        this.pid = pid
        this.priority = (Process.MIN_PRIORITY + Process.MAX_PRIORITY) / 2
    }

    lowerPriority() {
        if (this.priority > Process.MIN_PRIORITY)
            this.priority--
    }

    raisePriority() {
        if (this.priority < Process.MAX_PRIORITY)
            this.priority++
    }
}

export class StreamerProcess extends Process implements Streamer {
    networkInterface: NetworkInterface
    stream!: Stream

    private _allocation: number
    get allocation(): number {
        return this._allocation
    }

    /**
     * Limited to use its full capacity by its pair
     */
    isBounded: boolean

    //TODO properly inject handlers object
    handlers: { [signal: string]: { handler: any, callback: Function }[] } = {}

    constructor(pid: string, networkInterface: NetworkInterface) {
        super(pid)

        this.pid = pid + networkInterface.type + networkInterface.counter++

        this.networkInterface = networkInterface
        this.networkInterface.addProcess(this)
        this._allocation = 0
        this.isBounded = false
    }


    setBandwidth(amount: number) {
        const allocationChanged = this._allocation !== amount
        this._allocation = amount

        const maxAllocation = this.setMaxBandwidth()
        const unused = maxAllocation - amount

        if (unused > 0) {
            this.isBounded = true
        }
        else {
            this.isBounded = false
        }

        return allocationChanged
    }

    setMaxBandwidth(): number {
        // TODO check if running
        return this.networkInterface.getProcessMaxAllocation(this)
    }

    getMaxAllocationShare(): number {
        // TODO check if running
        return this.networkInterface.capacity * this.getPriorityRatio()
    }

    private getPriorityRatio(): number {
        return this.priority / this.networkInterface.getPrioritiesSum()
    }
}
export interface StreamerProcess extends Streamer, ISignalEmitter { }
applyMixins(StreamerProcess, [SignalEmitter])