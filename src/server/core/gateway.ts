import faker from 'faker'
import { EntityType, GameEntity, Presentable, Gui } from "../../common/types"
import { Downlink, RemoteConnection, Uplink } from "./network-interfaces"
import { Log } from './log'
import { Memory, Storage, CPU } from './resource'
import { OperationResult } from '../../shared'
import { TaskManager } from './task-manager'
import { Software } from './software/software'
import { User } from './player/hacked-db'
import { getCurrentPlayer } from './game-state'
import { ConnectionStatus } from '../../common/constants'
import { ISignalEmitter, signalEmitter, SIGNALS } from './signal'

export interface Gateway extends ISignalEmitter { }

@signalEmitter
export class Gateway implements GameEntity, Presentable<Gui.Gateway> {

    gameId: string
    entityType: EntityType = EntityType.GATEWAY

    ip: string
    hostname: string

    storage: Storage
    memory: Gui.Resource
    cpu: Gui.Resource
    downlink: Gui.INetworkInterface
    uplink: Gui.INetworkInterface

    taskManager: TaskManager
    users: Gui.User[]
    log: Log

    outboundConnection?: RemoteConnection
    inboundConnections: RemoteConnection[]

    //TODO: avoid collisions for id and ip
    constructor(config?: Partial<Gateway>) {
        this.gameId = config?.gameId || faker.random.uuid()

        this.ip = config?.ip || faker.internet.ip()
        this.hostname = config?.hostname || faker.internet.userName()

        this.storage = config?.storage || new Storage({ name: 'Disco Severo', capacity: 1000 })
        this.memory = config?.memory || new Memory('Rã', 1024)
        this.cpu = config?.cpu || new CPU('Pentelium III', 3000)

        this.downlink = config?.downlink || new Downlink('BR Robóticos', 14400)
        this.uplink = config?.uplink || new Uplink('BR Robóticos', 14400)

        this.taskManager = config?.taskManager || new TaskManager()
        this.users = config?.users || [new User({ userName: 'root' })]
        this.log = config?.log || new Log()

        this.outboundConnection = config?.outboundConnection
        this.inboundConnections = config?.inboundConnections || []
    }

    toClient(): GameEntity & Gui.Gateway {
        return {
            guiId: this.ip,
            entityType: this.entityType,

            ip: this.ip,
            hostname: this.hostname,

            storage: this.storage,

            outboundConnection: this.outboundConnection?.toClient(),
            taskManager: this.taskManager.toClient()
        }


        // clientGateway.storage = { files: [...serverGateway.storage.files] }

        // clientGateway.taskManager = serverGateway.taskManager.toClient()
    }


    getUser(userName: string) {
        return this.users.find(u => u.userName === userName)
    }



    connectTo(remoteGateway: Gateway) {

        if (this.outboundConnection !== undefined) {
            this.disconnect()
        }

        this.log.addEntry(`[localhost] connected to [${remoteGateway.ip}]`)
        remoteGateway.log.addEntry(`connection established from [${this.ip}]`)

        this.outboundConnection = new RemoteConnection({ gateway: remoteGateway })
        this.sendSignal(this, SIGNALS.NEW_REMOTE_CONNECTION, this.outboundConnection)

        this.outboundConnection.connect(remoteGateway)

        console.log(`[${this.gameId}]-[${this.hostname}] connected to [${remoteGateway.gameId}]-[${remoteGateway.ip}] - [${remoteGateway.hostname}]`)
    }

    disconnect() {
        // TODO: implement
        console.log(`Disconnecting`)

        const remoteGateway = this.outboundConnection?.gateway!

        this.log.addEntry(`[localhost] disconnected from [${remoteGateway.ip}]`)
        remoteGateway.log.addEntry(`connection from [${this.ip}] closed`)

        this.outboundConnection?.disconnect()

        //TODO: unregister all handlers
        this.outboundConnection = undefined
    }

    login(userName: string, password: string) {
        const result = new OperationResult()
        const player = getCurrentPlayer()

        console.log(`Login attempt from [${player.userName}] - userName[${userName}], password: [${password}] on gateway [${this.gameId}]`)

        result.assert(player.gateway.outboundConnection !== undefined, `Not connected to remote gateway`)
        if (player.gateway.outboundConnection === undefined) return result

        result.assert(player.gateway.outboundConnection.status !== ConnectionStatus.DISCONNECTED, `Not connected to remote gateway`)
        if (!result.isSuccessful()) return result

        const user = this.users.find(u => u.userName === userName)
        result.assert(user !== undefined, `User [${userName}] not found on [${this.ip}]`)
        if (user === undefined) return result

        result.assert(user.password === password, `Invalid password for user [${userName}]`)
        if (!result.isSuccessful()) return result

        player.hackedDB.addEntry(this, { userName, password, partial: false })

        player.gateway.log.addEntry(`[localhost] logged in to [${this.ip}] as [${userName}]`)
        this.log.addEntry(`[${player.gateway.ip}] logged in as [${userName}]`)

        player.gateway.outboundConnection.login(userName)


    }

    executeSoftware(id: string, ...args: any[]) {
        const validator = new OperationResult()

        const file = this.storage.files.find(f => f.guiId === id)

        validator.assert(file !== undefined, `File [${file}] not found.`)
        if (!file) return validator

        const software = file as Software

        validator.assert(software.spawnProcess !== undefined, `File [${file.name}] is not a software.`)
        if (!software.spawnProcess) return validator

        const result = software.spawnProcess(...args)

        if (result.isSuccessful()) {
            this.taskManager.startProcess(result.details.process)
        }



        // const requirements = software.requirements

        // validator.validate(this.memory.canAllocate(requirements.memory)
        //     , `Not enough memory. You need ${requirements.memory + this.memory.allocated - this.memory.capacity} more.`)

        // validator.validate(requirements.remoteConnection !== true || this.remoteConnection.status === ConnectionStatus.CONNECTED
        //     , `A connection to a remote server is required`)

        if (!validator.isSuccessful()) return validator

        // const process = new Process('123')
        // this.processes.push(process)
        // validator.details.process = process

        return validator
    }
}