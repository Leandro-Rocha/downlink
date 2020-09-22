import { ISignalEmitter, SIGNALS, signalEmitter, SignalEmitter } from "./signal"
import { OperationResult } from "../../shared"
import { ConnectionStatus, ResourceTypes } from "../../common/constants"
import { Types } from "../../common/types"
import { StreamerProcess } from "./process"
import { Gateway } from "./gateway"
import { File } from "./resource"
import { getCurrentPlayer } from "./game-state"



export enum AccessPrivileges {
    LOG = 'LOG',
    FTP = 'FTP',
    SSH = 'SSH',
    ROOT = 'ROOT',
}


@signalEmitter
export class BounceInfo {
    maxBandwidth: number = Number.MAX_VALUE
    limiters: Types.Stream[] = []
}
export interface BounceInfo extends ISignalEmitter { }

interface IBouncer {
    bounceInfo: BounceInfo
}

export class NetworkStream implements Types.Stream, IBouncer {
    bandWidth: number

    upStreamer: Types.StreamerProcess
    downStreamer: Types.StreamerProcess

    bounceInfo!: BounceInfo

    description: string


    constructor(upStreamer: Types.StreamerProcess, downStreamer: Types.StreamerProcess) {
        this.upStreamer = upStreamer
        this.downStreamer = downStreamer

        this.description = `${upStreamer.pid}->${downStreamer.pid}`
        this.bandWidth = 0
    }

    updateBandwidth() {
        var newAllocation = Math.min(this.upStreamer.getMaxBandwidth(), this.downStreamer.getMaxBandwidth())
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

        const upstreamerAllocationChanged = this.upStreamer.updateBandwidth(newAllocation)
        const downStreamerAllocationChanged = this.downStreamer.updateBandwidth(newAllocation)

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

export class NetworkInterface implements Types.INetworkInterface {

    name: string
    type: ResourceTypes
    capacity: number
    allocated: number

    private processes: Types.StreamerProcess[] = []
    prioritiesSum: number = 0

    constructor(name: string, type: ResourceTypes, capacity: number) {
        this.name = name
        this.type = type
        this.capacity = capacity

        this.allocated = 0
    }


    addProcess(process: Types.StreamerProcess) {
        this.processes.push(process)

        this.updatePriorities()

        process.registerHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.handleStreamerAllocationChanged)
        process.registerHandler(this, SIGNALS.PROCESS_PRIORITY_CHANGED, this.handleProcessPriorityChanged)
    }

    removeProcess(process: Types.StreamerProcess) {
        this.processes = this.processes.filter(p => p !== process)

        this.updatePriorities()

        process.unregisterSignalHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED)
    }

    getProcessMaxAllocation(process: Types.StreamerProcess): number {
        var maxAllocation = process.fairBandwidth

        const unusedAllocation = this.processes
            .filter(p => p !== process)
            .filter(p => p.isBounded)
            .filter(p => p.bandWidth <= p.fairBandwidth)
            .map(p => p.fairBandwidth - p.bandWidth)
            .reduce((acc, unused) => acc += unused, 0)

        if (unusedAllocation > 0) {
            maxAllocation += unusedAllocation
        }

        return maxAllocation
    }

    handleStreamerAllocationChanged(emitter: Types.StreamerProcess, date: any) {
        const otherProcesses = this.processes.filter(p => p !== emitter)
        if (otherProcesses.length === 0) return

        // console.log(`allocation changed by process [${emitter.pid}_${date}]:${emitter.allocation}, changing allocation of ${otherProcesses.map(p => p.stream.description)}`)
        otherProcesses.forEach(p => p.stream.updateBandwidth())
    }

    handleProcessPriorityChanged() {
        this.updatePriorities()
    }

    private updatePriorities() {
        this.prioritiesSum = this.processes.reduce((acc, process) => acc += process.priority, 0)

        this.processes.forEach(p => {
            p.priorityRatio = p.priority / this.prioritiesSum
            p.fairBandwidth = this.capacity * p.priorityRatio
        })
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

export interface RemoteConnection extends SignalEmitter { }

@signalEmitter
export class RemoteConnection implements Types.RemoteConnection {
    status: ConnectionStatus
    gateway?: Gateway
    loggedAs?: string

    constructor(config?: Partial<RemoteConnection>) {
        this.status = config?.status || ConnectionStatus.DISCONNECTED
        this.gateway = config?.gateway
        this.loggedAs = config?.loggedAs
    }


    connect(remoteGateway: Gateway) {
        //TODO: Sanity
        this.gateway = remoteGateway
        this.status = ConnectionStatus.CONNECTED
        this.sendSignal(this, SIGNALS.REMOTE_CONNECTION_CHANGED)
    }

    login(asUser: string) {
        //TODO: sanity
        if (this.gateway == undefined) return

        this.status = ConnectionStatus.LOGGED
        this.loggedAs = asUser

        const player = getCurrentPlayer()
        player.gateway.log.addEntry(`localhost logged in to [${player.gateway.outboundConnection.gateway?.ip}] as [${asUser}]`)
        player.gateway.outboundConnection.gateway?.log.addEntry(`[${player.gateway.ip}] logged in as [${asUser}]`)

        this.sendSignal(this, SIGNALS.REMOTE_CONNECTION_CHANGED)
    }

    toClient(): Partial<Types.RemoteConnection> {
        return <Partial<Types.RemoteConnection>>{
            status: this.status
        }
    }
}




type FileTransferDetails = { stream: Types.Stream, uploadProcess: StreamerProcess, downloadProcess: StreamerProcess }[]

export class FileTransferFactory {

    private file: File
    private connectionPath: Gateway[]
    private result: OperationResult<FileTransferDetails>

    constructor(file: File, ...connectionPath: Gateway[]) {
        this.file = file
        this.connectionPath = connectionPath
        this.result = new OperationResult<FileTransferDetails>()
        this.result.details = []
    }

    validate() {
        // const fileOwner = connectionPath[connectionPath.length - 1]
        // result.validate(fileOwner.storage.files.includes(file), `File [${file.name}] does not exists.`)
        // if (!result.isSuccessful()) return result

        this.result.validate(this.connectionPath.length > 1, `2 or more Gateways are required for a file transfer.`)
        if (!this.result.isSuccessful()) return this.result
    }

    create(): OperationResult<FileTransferDetails> {

        var workingConnectionPath = [...this.connectionPath]

        const bounceInfo = new BounceInfo()

        while (workingConnectionPath.length > 1) {
            const uploader = workingConnectionPath.shift()!
            const downloader = workingConnectionPath[0]

            // TODO automate PID generation
            const uploadProcess = new StreamerProcess(uploader.uplink)
            const downloadProcess = new StreamerProcess(downloader.downlink)
            const stream = new NetworkStream(uploadProcess, downloadProcess)

            uploadProcess.stream = stream
            downloadProcess.stream = stream

            uploader.uplink.addProcess(uploadProcess)
            downloader.downlink.addProcess(downloadProcess)

            this.result.details.push({ stream, uploadProcess, downloadProcess })

            if (this.connectionPath.length > 2) {
                stream.bounceInfo = bounceInfo

                bounceInfo.registerHandler(stream, SIGNALS.BOUNCE_ALLOCATION_CHANGED, stream.handleBounceAllocationChanged)
            }

            uploader.taskManager.startProcess(uploadProcess)
            downloader.taskManager.startProcess(downloadProcess)
        }

        return this.result
    }
}