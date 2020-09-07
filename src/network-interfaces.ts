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

export class BounceInfo {
    maxBandwidth: number = Number.MAX_VALUE
    limiters: Stream[] = []

    //TODO properly inject handlers object
    handlers: { [signal: string]: { handler: any, callback: Function }[] } = {}
}
export interface BounceInfo extends ISignalEmitter { }
applyMixins(BounceInfo, [SignalEmitter])

interface IBouncer {
    upstream?: NetworkStream
    downstream?: NetworkStream
    bounceInfo: BounceInfo
}

export class NetworkStream implements Stream, IBouncer {
    bandWidth: number

    upStreamer: StreamerProcess
    downStreamer: StreamerProcess

    upstream?: NetworkStream
    downstream?: NetworkStream
    bounceInfo!: BounceInfo

    description: string


    constructor(upStreamer: StreamerProcess, downStreamer: StreamerProcess, streams?: { upstream?: NetworkStream, downstream?: NetworkStream }) {
        this.upStreamer = upStreamer
        this.downStreamer = downStreamer
        this.upstream = streams?.upstream
        this.downstream = streams?.downstream

        this.description = `${upStreamer.pid}->${downStreamer.pid}`

        this.bandWidth = 0

        this.upStreamer.stream = this
        this.downStreamer.stream = this
    }

    updateBandwidth() {
        var newAllocation = Math.min(this.upStreamer.getMaxAllocation(), this.downStreamer.getMaxAllocation())
        const allocationChanged = this.bandWidth !== newAllocation
        var bounceBandwidthChanged = false

        if (this.bounceInfo !== undefined) {
            // This Stream will be limited by the bounce
            if (this.bounceInfo.maxBandwidth < newAllocation) {
                newAllocation = this.bounceInfo.maxBandwidth
                this.bounceInfo.limiters = this.bounceInfo.limiters.filter(s => s != this)
            }
            // This Stream is limiting the bounce
            else if (this.bounceInfo.maxBandwidth === newAllocation && allocationChanged) {
                this.bounceInfo.limiters.push(this)
            }
            // This Stream is limiting the bounce
            else if (allocationChanged) {
                this.bounceInfo.maxBandwidth = newAllocation
                this.bounceInfo.limiters = []
                this.bounceInfo.limiters.push(this)
                bounceBandwidthChanged = true
            }
        }

        this.bandWidth = newAllocation

        const upstreamerAllocationChanged = this.upStreamer.allocate(newAllocation)
        const downStreamerAllocationChanged = this.downStreamer.allocate(newAllocation)

        if (upstreamerAllocationChanged) {
            this.upStreamer.sendSignal(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.upStreamer.pid)
        }

        if (downStreamerAllocationChanged) {
            this.downStreamer.sendSignal(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.downStreamer.pid)
        }

        if (bounceBandwidthChanged) {
            this.bounceInfo.sendSignal(this, SIGNALS.BOUNCE_ALLOCATION_CHANGED)
        }
    }

    setDownstream(stream: NetworkStream) {
        this.downstream = stream
        stream.bounceInfo.registerHandler(this, SIGNALS.BOUNCE_ALLOCATION_CHANGED, this.handleBounceAllocationChanged)
    }

    setUpstream(stream: NetworkStream) {
        this.upstream = stream
        stream.bounceInfo.registerHandler(this, SIGNALS.BOUNCE_ALLOCATION_CHANGED, this.handleBounceAllocationChanged)
    }


    handleBounceAllocationChanged(emitter: NetworkStream, ...args: any) {
        // console.log(`Bounce allocation changed, bw[${this.bounceInfo.maxBandwidth}] updating upstream [${this.description}]`)
        this.updateBandwidth()

        // if (emitter.upstream !== undefined) {
        //     // console.log(`allocation changed for [${emitter.description}] updating upstream [${emitter.upstream.description}]`)
        //     emitter.upstream.updateBandwidth()
        // }

        // if (emitter.downstream !== undefined) {
        //     // console.log(`allocation changed for [${emitter.description}] updating downstream [${emitter.downstream.description}]`)
        //     emitter.downstream.updateBandwidth()
        // }

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
        process.registerHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.handleStreamerAllocationChanged)
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

    handleStreamerAllocationChanged(emitter: StreamerProcess, ...args: any) {
        const otherProcesses = this.processes.filter(p => p !== emitter)

        // if (otherProcesses.length > 0)
        //     console.log(`allocation changed for process [${emitter.pid}], changing allocation of ${otherProcesses.map(p => p.stream.description)}`)

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

        return allocationChanged
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