import { ISignalEmitter } from "../server/core/signal";
import { ConnectionStatus, ProcessStatus, ResourceTypes } from "./constants"

export interface GameState {
    localGateway: Partial<Types.Gateway>
    remoteGateway?: Partial<Types.Gateway>
    hackedDB: Partial<Types.HackedDB>
}

export interface Owner {
    name: string
}

export namespace Types {
    export interface Gateway extends Presentable<Gateway> {
        id: string
        ip: string
        hostname: string

        storage: Storage
        memory: Resource
        cpu: Resource
        downlink: INetworkInterface
        uplink: INetworkInterface

        taskManager: TaskManager

        users: User[]
        log: Log

        outboundConnection?: RemoteConnection
        inboundConnections: RemoteConnection[]
    }

    export interface Storage extends Resource, Presentable<Storage> {
        files: File[]
    }

    export interface Process extends Presentable<Process> {
        readonly pid: string
        readonly priority: number
        userName: string
        status: ProcessStatus
        description: string
    }

    export interface WorkerProcess extends Process {
        totalWork: number
        workDone: number
    }

    export interface PasswordCrackerProcess extends WorkerProcess {
        password: string
        userToHack: Types.User
    }

    export interface TaskManager extends Presentable<TaskManager> {
        permanentProcesses: Process[]
        workerProcesses: PasswordCrackerProcess[]
    }

    export interface User {
        userName: string
        password: string
        partial: boolean
    }

    export interface Log {
        entries: LogEntry[]
    }

    export interface Resource {
        name: string
        type: ResourceTypes
        capacity: number
        allocated: number
    }

    export interface INetworkInterface extends Resource {
        prioritiesSum: number

        addProcess(process: StreamerProcess): void
        removeProcess(process: StreamerProcess): void
        getProcessMaxAllocation(process: StreamerProcess): number
        handleStreamerAllocationChanged(emitter: StreamerProcess, date: any): void
        handleProcessPriorityChanged(): void
    }

    export interface RemoteConnection extends Presentable<RemoteConnection> {
        status: ConnectionStatus
        ip: string
        loggedAs?: string
    }


    export interface File extends Presentable<File> {
        id: string
        name: string
        size: number
    }

    export interface Software extends File {
        version: number
    }

    export interface LogEntry {
        timestamp: string
        message: string
    }

    export interface Stream {
        bandWidth: number
        upStreamer: Streamer
        downStreamer: Streamer
        description: string
        updateBandwidth(): void
    }

    export interface Streamer {
        stream: Stream
        bandWidth: number
        updateBandwidth(amount: number): boolean
        getMaxBandwidth(): number
    }

    export interface StreamerProcess extends Types.Process, Streamer, ISignalEmitter {
        networkInterface: INetworkInterface
        stream: Stream
        priorityRatio: number
        fairBandwidth: number
        isBounded: boolean
    }

    export interface HackedDbEntry {
        ip: string
        users: User[]
    }

    export interface HackedDB {
        entries: HackedDbEntry[]
    }
}

export interface Presentable<T> {
    toClient(): Partial<T>
}
