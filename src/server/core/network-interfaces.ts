import { OperationResult } from "../../shared"
import { ConnectionStatus, ResourceTypes } from "../../common/constants"
import { EntityType, GameEntity, Gui } from "../../common/types"
import { StreamerProcess } from "./process"
import { Gateway } from "./gateway"
import { File } from "./resource"
import { signalEmitter, SignalEmitter, SIGNALS } from "./signal"



export enum AccessPrivileges {
    LOG = 'LOG',
    FTP = 'FTP',
    SSH = 'SSH',
    ROOT = 'ROOT',
}


@signalEmitter
export class BounceInfo {
    maxBandwidth: number = Number.MAX_VALUE
    limiters: Gui.Stream[] = []
}
export interface BounceInfo extends SignalEmitter { }

interface IBouncer {
    bounceInfo: BounceInfo
}

export class NetworkStream implements Gui.Stream, IBouncer {
    bandWidth: number

    upStreamer: StreamerProcess
    downStreamer: StreamerProcess

    bounceInfo!: BounceInfo

    description: string


    constructor(upStreamer: StreamerProcess, downStreamer: StreamerProcess) {
        this.upStreamer = upStreamer
        this.downStreamer = downStreamer

        this.description = `${upStreamer.id}->${downStreamer.id}`
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

export class NetworkInterface {
    id: string
    entityType: EntityType = EntityType.NETWORK_INTERFACE

    name: string
    type: ResourceTypes
    capacity: number
    allocated: number

    private processes: StreamerProcess[] = []
    prioritiesSum: number = 0

    constructor(name: string, type: ResourceTypes, capacity: number) {
        this.id = `NetworkInterface_${Date.now()}`
        this.name = name
        this.type = type
        this.capacity = capacity

        this.allocated = 0
    }


    addProcess(process: StreamerProcess) {
        this.processes.push(process)

        this.updatePriorities()

        process.registerHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED, this.handleStreamerAllocationChanged)
        process.registerHandler(this, SIGNALS.PROCESS_PRIORITY_CHANGED, this.handleProcessPriorityChanged)
    }

    removeProcess(process: StreamerProcess) {
        this.processes = this.processes.filter(p => p !== process)

        this.updatePriorities()

        process.unregisterSignalHandler(this, SIGNALS.STREAM_ALLOCATION_CHANGED)
    }

    getProcessMaxAllocation(process: StreamerProcess): number {
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

    handleStreamerAllocationChanged(emitter: StreamerProcess, date: any) {
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
export class RemoteConnection implements GameEntity, Gui.RemoteConnection {
    id: string
    entityType: EntityType = EntityType.REMOTE_CONNECTION

    ip: string
    status: ConnectionStatus
    loggedAs?: string

    gateway: Gateway

    constructor(config: Partial<RemoteConnection>) {
        this.id = config.id || `RemoteConnection_${Date.now()}`
        this.gateway = config.gateway!
        this.ip = this.gateway.ip
        this.status = config.status || ConnectionStatus.DISCONNECTED
        this.loggedAs = config.loggedAs
    }
    toClient(): GameEntity & Gui.RemoteConnection {
        return {
            id: this.id,
            entityType: this.entityType,

            ip: this.ip,
            status: this.status
        }
    }


    connect(remoteGateway: Gateway) {
        //TODO: Sanity
        this.gateway = remoteGateway
        this.status = ConnectionStatus.CONNECTED
        this.sendSignal(this, SIGNALS.REMOTE_CONNECTION_CHANGED)
    }

    disconnect() {
        //TODO: Sanity
        this.status = ConnectionStatus.DISCONNECTED
        this.sendSignal(this, SIGNALS.REMOTE_CONNECTION_CHANGED)
    }

    login(userName: string) {
        this.loggedAs = userName
        this.status = ConnectionStatus.LOGGED
        this.sendSignal(this, SIGNALS.REMOTE_CONNECTION_CHANGED)
    }

}




type FileTransferDetails = { stream: Gui.Stream, uploadProcess: StreamerProcess, downloadProcess: StreamerProcess }[]

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

        this.result.assert(this.connectionPath.length > 1, `2 or more Gateways are required for a file transfer.`)
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