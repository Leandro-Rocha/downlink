import faker from 'faker'
import { EntityType, GameEntity, Presentable, Gui } from "../../common/types"
import { Downlink, RemoteConnection, Uplink } from "./network-interfaces"
import { Log } from './log'
import { Memory, Storage, CPU } from './resource'
import { OperationResult, Validator } from '../../shared'
import { TaskManager } from './task-manager'
import { Software } from './software/software'
import { User } from './player/hacked-db'
import { getCurrentPlayer } from './game-state'
import { ConnectionStatus } from '../../common/constants'
import { propagator, Propagator, Watcher, watcher } from './signal'

export interface Gateway extends Propagator, Watcher { }

@propagator
@watcher
export class Gateway implements GameEntity, Presentable<Gui.Gateway> {

    id: string
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
        this.id = config?.id || faker.random.uuid()

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

        this.watchComponents()
    }

    watchComponents() {
        this.watch(this.taskManager)
        this.watch(this.log)

        if (this.outboundConnection)
            this.watch(this.outboundConnection)
    }

    toClient(): GameEntity & Gui.Gateway {
        return {
            id: this.id,
            entityType: this.entityType,

            ip: this.ip,
            hostname: this.hostname,

            storage: this.storage.toClient(),
            memory: this.memory,
            cpu: this.cpu,
            downlink: this.downlink,
            uplink: this.uplink,

            users: this.users,
            log: this.log.toClient(),

            inboundConnections: this.inboundConnections,
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
        this.watch(this.outboundConnection)

        this.outboundConnection.connect(remoteGateway)

        this.watch(remoteGateway.log)

        console.log(`[${this.id}]-[${this.hostname}] connected to [${remoteGateway.id}]-[${remoteGateway.ip}] - [${remoteGateway.hostname}]`)
    }

    disconnect() {
        // TODO: implement
        console.log(`Disconnecting`)

        const connection = this.outboundConnection
        const remoteGateway = connection?.gateway!

        this.log.addEntry(`[localhost] disconnected from [${remoteGateway.ip}]`)
        remoteGateway.log.addEntry(`connection from [${this.ip}] closed`)

        //TODO: unregister all handlers
        this.outboundConnection = undefined

        connection?.disconnect()
    }

    login(userName: string, password: string) {
        const result = new OperationResult()
        const player = getCurrentPlayer()

        console.log(`Login attempt from [${player.userName}] - userName[${userName}], password: [${password}] on gateway [${this.id}]`)

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

        const file = this.storage.files.find(f => f.id === id)
        Validator.assert(file !== undefined, `File [${file}] not found.`)

        const software = file as Software
        Validator.assert(software.spawnProcess !== undefined, `File [${file!.name}] is not a software.`)

        const process = software.spawnProcess(...args)

        const softwareTypeAlreadyRunning = this.taskManager.processes.some(p => p.entityType === process.entityType)
        Validator.assert(!softwareTypeAlreadyRunning, `Software of the same type already running.`)


        if (process) {
            this.taskManager.startProcess(process)
        }



        // const requirements = software.requirements

        // validator.validate(this.memory.canAllocate(requirements.memory)
        //     , `Not enough memory. You need ${requirements.memory + this.memory.allocated - this.memory.capacity} more.`)


    }
}

