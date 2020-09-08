import { ISignalEmitter, SignalEmitter, SIGNALS, signalEmitter } from "./signal"
import { Resource, ResourceTypes } from "./resource"
import { applyMixins, OperationResult } from "../shared"
import { StreamerProcess } from "./process"
import { Gateway } from "./gateway"
import { File } from "../../test/game-interfaces"


export interface Stream {
    bandWidth: number
    upStreamer: Streamer
    downStreamer: Streamer
    description: string
    updateBandwidth(): void
}

export interface Streamer extends ISignalEmitter {
    stream: Stream
    setBandwidth(amount: number): void
    setMaxBandwidth(): number
}

export enum ConnectionStatus {
    KNOWN = 'KNOWN',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
}

export enum AccessPrivileges {
    LOG = 'LOG',
    FTP = 'FTP',
    SSH = 'SSH',
    ROOT = 'ROOT',
}

export interface RemoteConnection {
    // gateway?: Gateway
    status: ConnectionStatus
    privileges?: AccessPrivileges[]
}

@signalEmitter
export class BounceInfo {
    maxBandwidth: number = Number.MAX_VALUE
    limiters: Stream[] = []
}
export interface BounceInfo extends ISignalEmitter { }

interface IBouncer {
    bounceInfo: BounceInfo
}

export class NetworkStream implements Stream, IBouncer {
    bandWidth: number

    upStreamer: StreamerProcess
    downStreamer: StreamerProcess

    bounceInfo!: BounceInfo

    description: string


    constructor(upStreamer: StreamerProcess, downStreamer: StreamerProcess) {
        this.upStreamer = upStreamer
        this.downStreamer = downStreamer

        this.description = `${upStreamer.pid}->${downStreamer.pid}`

        this.bandWidth = 0

        this.upStreamer.stream = this
        this.downStreamer.stream = this
    }

    updateBandwidth() {
        var newAllocation = Math.min(this.upStreamer.setMaxBandwidth(), this.downStreamer.setMaxBandwidth())
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

        const upstreamerAllocationChanged = this.upStreamer.setBandwidth(newAllocation)
        const downStreamerAllocationChanged = this.downStreamer.setBandwidth(newAllocation)

        if (upstreamerAllocationChanged) {
            const now = Date.now()
            // console.log(`Signal from [${this.upStreamer.pid}_${now}]`)

            this.upStreamer.sendSignal(this.upStreamer, SIGNALS.STREAM_ALLOCATION_CHANGED, now)
        }

        if (downStreamerAllocationChanged) {
            const now = Date.now()
            // console.log(`Signal from [${this.downStreamer.pid}_${now}]`)
            this.downStreamer.sendSignal(this.downStreamer, SIGNALS.STREAM_ALLOCATION_CHANGED, now)
        }

        if (bounceBandwidthChanged) {
            this.bounceInfo.sendSignal(this, SIGNALS.BOUNCE_ALLOCATION_CHANGED)
        }
    }

    handleBounceAllocationChanged(emitter: NetworkStream, ...args: any) {
        if (this === emitter) return
        // console.log(`Bounce allocation changed br[${emitter.description}], bw[${this.bounceInfo.maxBandwidth}] updating stream [${this.description}]`)
        this.updateBandwidth()
    }
}

export class NetworkInterface extends Resource {
    counter = 1

    private processes: StreamerProcess[] = []

    constructor(name: string, type: ResourceTypes, capacity: number) {
        super(name, type, capacity)
    }

    addProcess(process: StreamerProcess) {
        process.registerHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.handleStreamerAllocationChanged)
        this.processes.push(process)
    }

    removeProcess(process: StreamerProcess) {
        process.unregisterHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED)
        this.processes = this.processes.filter(p => p !== process)
    }

    getProcessMaxAllocation(process: StreamerProcess): number {
        var maxAllocation = this.capacity * (process.priority / this.getPrioritiesSum())

        const unusedAllocation = this.processes
            .filter(p => p !== process)
            .filter(p => p.isBounded)
            .filter(p => p.allocation <= p.getMaxAllocationShare())
            .map(p => p.getMaxAllocationShare() - p.allocation)
            .reduce((acc, unused) => acc += unused, 0)

        if (unusedAllocation > 0) {
            maxAllocation += unusedAllocation
        }

        return maxAllocation
    }

    handleStreamerAllocationChanged(emitter: StreamerProcess, date: any) {
        const otherProcesses = this.processes.filter(p => p !== emitter)
        if (otherProcesses.length === 0) return

        // console.log(`allocation changed by process [${emitter.pid}_${date}]:${emitter.allocation}, changing allocation of ${otherProcesses.map(p => p.stream.description)}`)
        otherProcesses.forEach(p => p.stream.updateBandwidth())
    }

    getPrioritiesSum() {
        return this.processes.reduce((acc, process) => acc += process.priority, 0)
    }
}

export class Downlink extends NetworkInterface {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.DOWNLINK, capacity)
    }
}

export class Uplink extends NetworkInterface {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.UPLINK, capacity)
    }
}




type FileTransferDetails = { stream: Stream, uploadProcess: StreamerProcess, downloadProcess: StreamerProcess }[]

export class FileTransferFactory {

    static create(file: File, ...connectionPath: Gateway[]): OperationResult<FileTransferDetails> {
        const result = new OperationResult<FileTransferDetails>()
        result.details = []

        result.validate(connectionPath.length > 1, `2 or more Gateways are required for a file transfer.`)
        if (!result.isSuccessful()) return result

        var workingConnectionPath = [...connectionPath]

        // const fileOwner = connectionPath[connectionPath.length - 1]
        // result.validate(fileOwner.storage.files.includes(file), `File [${file.name}] does not exists.`)
        // if (!result.isSuccessful()) return result

        const bounceInfo = new BounceInfo()

        while (workingConnectionPath.length > 1) {
            const uploader = workingConnectionPath.shift()!
            const downloader = workingConnectionPath[0]

            const uploadProcess = new StreamerProcess(uploader.owner.name, uploader.uplink)
            const downloadProcess = new StreamerProcess(downloader.owner.name, downloader.downlink)

            const stream = new NetworkStream(uploadProcess, downloadProcess)

            result.details.push({ stream, uploadProcess, downloadProcess })

            if (connectionPath.length > 2) {
                stream.bounceInfo = bounceInfo

                bounceInfo.registerHandler(stream, SIGNALS.BOUNCE_ALLOCATION_CHANGED, stream.handleBounceAllocationChanged)
            }

            uploader.processes.push(uploadProcess)
            downloader.processes.push(downloadProcess)
        }

        return result
    }
}