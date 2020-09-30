import { ConnectionStatus, ProcessStatus, ResourceTypes } from "./constants"

export interface GameState {
    localGateway: Partial<Gui.Gateway>
    remoteGateway?: Partial<Gui.Gateway>
    hackedDB: Partial<Gui.HackedDB>
}

export interface Owner {
    name: string
}

export namespace Gui {

    export interface Gateway extends GameEntity {
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

    export interface Storage extends Resource {
        files: File[]
    }

    export interface Process extends GameEntity {
        priority: number
        userName: string
        status: ProcessStatus
        description?: string
    }

    export interface WorkerProcess extends Process {
        totalWork: number
        workDone?: number
    }

    export interface PasswordCrackerProcess extends WorkerProcess {
        password: string
        userToHack: Gui.User
    }

    export interface TaskManager {
        daemons: Process[]
        processes: WorkerProcess[]
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

    export interface RemoteConnection {
        status: ConnectionStatus
        ip: string
        loggedAs?: string
    }


    export interface File extends GameEntity {
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

    export interface StreamerProcess extends Streamer {
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
    toClient(): GameEntity & T
}


export interface GameEntity {
    id: string
    entityType: EntityType
}

export enum EntityType {
    GATEWAY = 'GATEWAY',
    HACKED_DB_ENTRY = 'HACKED_DB_ENTRY',
    HACKED_DB = 'HACKED_DB',

    FILE = 'FILE',
    REMOTE_CONNECTION = 'REMOTE_CONNECTION',

    RESOURCE_STORAGE = 'RESOURCE_STORAGE',
    RESOURCE_CPU = 'RESOURCE_CPU',
    RESOURCE_MEMORY = 'RESOURCE_MEMORY',

    TASK_MANAGER = 'WINDOW_TASK_MANAGER',
    WINDOW_FILE_MANAGER = 'WINDOW_FILE_MANAGER',

    PROCESS_TRANSFER = 'PROCESS_TRANSFER',
    PROCESS_CRACKER = 'PROCESS_CRACKER',
}