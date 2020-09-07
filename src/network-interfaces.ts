import { ISignalEmitter, SignalEmitter, SIGNALS } from "./signal"
import { Resource, ResourceTypes } from "./core/resource"
import { applyMixins, OperationResult } from "./shared"
import { StreamerProcess } from "./core/process"


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
            this.upStreamer.sendSignal(this.upStreamer, SIGNALS.STREAM_ALLOCATION_CHANGED, this.upStreamer.pid)
        }

        if (downStreamerAllocationChanged) {
            this.downStreamer.sendSignal(this.downStreamer, SIGNALS.STREAM_ALLOCATION_CHANGED, this.downStreamer.pid)
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
            .map(p => p.getMaxAllocationShare() - p.allocation)
            .reduce((acc, unused) => acc += unused, 0)

        if (unusedAllocation > 0) {
            maxAllocation += unusedAllocation
        }

        return maxAllocation
    }

    handleStreamerAllocationChanged(emitter: StreamerProcess) {
        const otherProcesses = this.processes.filter(p => p !== emitter)
        if (otherProcesses.length === 0) return

        // console.log(`allocation changed by process [${emitter.pid}], changing allocation of ${otherProcesses.map(p => p.stream.description)}`)
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




type FileTransferDetails = { pairs: { downloadProcess: StreamerProcess, uploadProcess: StreamerProcess }[] }

export enum FileTransferType {
    DOWNLOAD = 'DOWNLOAD',
    UPLOAD = 'UPLOAD'
}

// class FileTransferFactory {

//     static createFileTransfer(transferType: FileTransferType, file: File, ...connectionPath: Gateway[]): OperationResult<FileTransferDetails> {
//         const result = new OperationResult<FileTransferDetails>()
//         result.details = { pairs: [] }

//         result.validate(connectionPath.length > 1, `2 or more Gateways are required for a file transfer.`)
//         if (!result.isSuccessful()) return result

//         var workingConnectionPath = [...connectionPath]

//         if (transferType === FileTransferType.UPLOAD)
//             workingConnectionPath = workingConnectionPath.reverse()

//         const fileOwner = connectionPath[connectionPath.length - 1]
//         result.validate(fileOwner.storage.files.includes(file), `File [${file.name}] does not exists.`)
//         if (!result.isSuccessful()) return result

//         const bounceInfo: { sharedAllocation: number, chain: NetworkProcess[] } = { sharedAllocation: Number.MAX_VALUE, chain: [] }

//         while (workingConnectionPath.length > 1) {
//             const downloader = workingConnectionPath.shift()!
//             const uploader = workingConnectionPath[0]

//             const downloadProcess = new NetworkProcess(downloader.owner.name, downloader.downlink)
//             const uploadProcess = new NetworkProcess(uploader.owner.name, uploader.uplink)

//             downloadProcess.pair = uploadProcess
//             uploadProcess.pair = downloadProcess

//             result.details.pairs.push({ downloadProcess: downloadProcess, uploadProcess: uploadProcess })

//             if (connectionPath.length > 2) {
//                 bounceInfo.chain.push(downloadProcess)
//                 downloadProcess.bounceInfo = bounceInfo

//                 bounceInfo.chain.push(uploadProcess)
//                 uploadProcess.bounceInfo = bounceInfo
//             }

//             // downloader.downlink.processes.push(downloadProcess)
//             // downloader.processes.push(downloadProcess)

//             // uploader.uplink.processes.push(uploadProcess)
//             // uploader.processes.push(uploadProcess)

//             // ResourceManager.addToReallocation(downloader.downlink, uploader.uplink)
//         }

//         return result
//     }
// }