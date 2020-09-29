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

    export interface Gateway extends Presentable<Gateway> {
        guiId: string
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

    export interface Process extends Presentable<Process>, GameEntity {
        readonly priority: number
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

    export interface TaskManager extends Presentable<TaskManager> {
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


    export interface File {
        guiId: string
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
    gameId: string
    entityType: EntityType
}

export enum EntityType {
    GATEWAY = 'GATEWAY',

    FILE = 'FILE',

    RESOURCE_STORAGE = 'RESOURCE_STORAGE',

    WINDOW_TASK_MANAGER = 'WINDOW_TASK_MANAGER',
    WINDOW_FILE_MANAGER = 'WINDOW_FILE_MANAGER',

    PROCESS_TRANSFER = 'PROCESS_TRANSFER',
    PROCESS_CRACKER = 'PROCESS_CRACKER',
}