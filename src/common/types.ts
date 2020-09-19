import { ISignalEmitter, SignalEmitter } from "../server/core/signal";
import { ConnectionStatus, ProcessStatus, ResourceTypes } from "./constants";

export interface GameState {
    localGateway: Client.Gateway
    remoteGateway?: Client.Gateway
}

export interface Owner {
    name: string
}

export namespace Types {
    export interface Gateway {
        id: string
        ip: string
        hostname: string

        storage: Storage
        memory: Resource
        cpu: Resource
        downlink: INetworkInterface
        uplink: INetworkInterface

        processes: Process[]
        users: User[]
        log: Log

        outboundConnection: RemoteConnection
        inboundConnections: RemoteConnection[]
    }

    export interface Storage {
        files: File[]
    }

    export interface Process {
        pid: string
        user: User
        priority: number
        status: ProcessStatus
        description: string
    }

    export interface User {
        userName: string
        password: string
    }

    export interface Log {
        entries: LogEntry[]
        addEntry(message: string): void
    }

    export interface Resource {
        name: string
        type: ResourceTypes
        capacity: number
        allocated: number
    }

    export interface INetworkInterface extends Resource {
        prioritiesSum: number

        addProcess(process: IStreamerProcess): void
        removeProcess(process: IStreamerProcess): void
        getProcessMaxAllocation(process: IStreamerProcess): number
        handleStreamerAllocationChanged(emitter: IStreamerProcess, date: any): void
        handleProcessPriorityChanged(): void
    }
    export interface RemoteConnection {
        status: ConnectionStatus
        gateway?: Types.Gateway
        loggedAs?: string
    }


    export interface File {
        name: string
        size: number
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

    export interface IStreamerProcess extends Types.Process, Streamer, ISignalEmitter {
        networkInterface: INetworkInterface
        stream: Stream
        priorityRatio: number
        fairBandwidth: number
        isBounded: boolean
    }
}


export namespace Client {
    export interface Gateway extends Partial<Types.Gateway> {
        ip: string
        hostname: string
    }
}



