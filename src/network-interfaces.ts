import { ISignalEmitter, SignalEmitter, SIGNALS } from "./signal"
import { Resource, ResourceTypes } from "./resource"


export interface Stream {
    bandWidth: number
    upStreamer: Streamer
    downStreamer: Streamer
    upstream?: Stream
    downstream?: Stream
    description: string
    updateBandwidth(): void
}

export interface Streamer extends ISignalEmitter {
    stream: Stream
    allocate(amount: number): void
    getMaxAllocation(): number
}

export class NetworkStream implements Stream {
    bandWidth: number

    upStreamer: StreamerProcess
    downStreamer: StreamerProcess
    upstream?: NetworkStream
    downstream?: NetworkStream

    description: string

    constructor(upStreamer: StreamerProcess, downStreamer: StreamerProcess, streamers?: { upstream?: NetworkStream, downstream?: NetworkStream }) {
        this.upStreamer = upStreamer
        this.downStreamer = downStreamer
        this.upstream = streamers?.upstream
        this.downstream = streamers?.downstream

        this.description = `${upStreamer.pid}->${downStreamer.pid}`

        this.bandWidth = 0

        this.upStreamer.stream = this
        this.downStreamer.stream = this

        this.upStreamer.registerHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.handleStreamAllocationChanged)
        this.downStreamer.registerHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.handleStreamAllocationChanged)
    }

    updateBandwidth() {
        const newAllocation = Math.min(this.upStreamer.getMaxAllocation(), this.downStreamer.getMaxAllocation())

        this.upStreamer.allocate(newAllocation)
        this.downStreamer.allocate(newAllocation)

        this.bandWidth = newAllocation
    }

    handleStreamAllocationChanged(who: StreamerProcess, ...args: any) {
        // who === this.upStreamer && console.log(`allocation changed for upStreamer ` + [who.pid])
        // who === this.downStreamer && console.log(`allocation changed for downStreamer ` + [args])

    }
}

export class NetworkInterface extends Resource {
    counter = 1

    private processes: StreamerProcess[] = []
    unusedCapacityList: { process: StreamerProcess, amount: number }[] = []

    constructor(name: string, type: ResourceTypes, capacity: number) {
        super(name, type, capacity)
    }

    addProcess(process: StreamerProcess) {
        process.registerHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.handleStreamAllocationChanged)
        this.processes.push(process)
    }

    getProcessMaxAllocation(process: StreamerProcess): number {
        var maxAllocation = this.capacity * (process.priority / this.getPrioritiesSum())
        const unusedAllocation = this.processes
            .filter(p => p !== process)
            .filter(p => p.isBounded)
            .map(p => p.getMaxAllocationShare() - p.allocation)
            .reduce((acc, unused) => acc += unused, 0)

        if (unusedAllocation > 0) {
            maxAllocation += unusedAllocation
        }

        return maxAllocation
    }

    getAvailableAllocation(): number {
        return this.capacity + this.getUnusedAllocation()
    }

    getUnusedAllocation() {
        const unused = this.processes
            .filter(p => p.isBounded)
            .filter(p => p.isBounded)
            .map(p => p.getMaxAllocationShare() - p.allocation)
            .reduce((acc, unused) => acc += unused, 0)

        if (unused < 0) console.log('Returning less than zero')
        return unused < 0 ? 0 : unused
    }

    handleStreamAllocationChanged(emitter: StreamerProcess, ...args: any) {
        const otherProcesses = this.processes.filter(p => p !== emitter)

        if (otherProcesses.length > 0)
            console.log(`allocation changed for process [${emitter.pid}], changing allocation of ${otherProcesses.map(p => p.stream.description)}`)

        otherProcesses.forEach(p => p.stream.updateBandwidth())
    }

    getPrioritiesSum() {
        return this.processes.reduce((acc, process) => acc += process.priority, 0)
    }

    getUnboundedPrioritiesSum() {
        return this.processes
            .filter(p => p.isBounded)
            .reduce((acc, process) => acc += process.priority, 0)
    }
}

class Process {
    pid: string
    priority: number

    constructor(pid: string) {
        this.pid = pid
        this.priority = 5
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


    allocate(amount: number) {
        const allocationChanged = this._allocation !== amount
        this._allocation = amount

        const maxAllocation = this.getMaxAllocation()
        const unused = maxAllocation - amount

        if (unused > 0) {
            this.isBounded = true
        }
        else {
            this.isBounded = false
        }

        if (allocationChanged) {
            this.sendSignal(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.pid)
        }
    }

    getMaxAllocation(): number {
        // TODO check if running
        return this.networkInterface.getProcessMaxAllocation(this)
    }

    getMaxAllocationShare(): number {
        // TODO check if running
        return this.networkInterface.capacity * this.getPriorityRatio()
    }

    getUnusedAllocationShare(): number {
        // TODO check if running
        return this.networkInterface.getUnusedAllocation() * this.getUnusedPriorityRatio() || 1
    }


    private getPriorityRatio(): number {
        return this.priority / this.networkInterface.getPrioritiesSum()
    }

    private getUnusedPriorityRatio(): number {
        return this.priority / this.networkInterface.getUnboundedPrioritiesSum()
    }
}

export interface StreamerProcess extends Streamer, ISignalEmitter { }
applyMixins(StreamerProcess, [SignalEmitter])

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name]
        })
    })
}