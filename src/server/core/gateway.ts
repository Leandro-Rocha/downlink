import faker from 'faker'
import { Types } from "../../common/types"
import { Downlink, RemoteConnection, Uplink } from "./network-interfaces"
import { Log } from './log'
import { Memory, Storage, CPU } from './resource'
import { OperationResult } from '../../shared'
import { TaskManager } from './task-manager'
import { Player } from './owner'
import { Software } from './software/software'
import { User } from './player/hacked-db'


export class Gateway implements Types.Gateway {

    id: string
    ip: string
    hostname: string

    storage: Types.Storage
    memory: Types.Resource
    cpu: Types.Resource
    downlink: Types.INetworkInterface
    uplink: Types.INetworkInterface

    taskManager: TaskManager
    users: Types.User[]
    log: Log

    outboundConnection: RemoteConnection
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

        this.outboundConnection = config?.outboundConnection || new RemoteConnection()
        this.inboundConnections = config?.inboundConnections || []
    }

    getUser(userName: string) {
        return this.users.find(u => u.userName === userName)
    }

    toClient(): Partial<Types.Gateway> {
        return <Partial<Types.Gateway>>{
            ip: this.ip,
            hostname: this.hostname,

            storage: this.storage,

            outboundConnection: this.outboundConnection.toClient(),
            taskManager: this.taskManager.toClient()
        }


        // clientGateway.storage = { files: [...serverGateway.storage.files] }

        // clientGateway.taskManager = serverGateway.taskManager.toClient()

    }

    connectTo(remoteGateway: Gateway) {

        this.outboundConnection.connect(remoteGateway)

        this.log.addEntry(`localhost connected to [${remoteGateway.ip}]`)
        remoteGateway.log.addEntry(`connection from [${this.ip}]`)

        console.debug(`[${this.hostname}] connected to [${remoteGateway.ip}] - [${remoteGateway.hostname}]`)
    }

    remoteLogin(asUser: string) {
        this.outboundConnection.login(asUser)
    }

    executeSoftware(player: Player, id: string, ...args: any[]) {
        const validator = new OperationResult()

        const file = this.storage.files.find(f => f.id === id)

        validator.validate(file !== undefined, `File [${file}] not found.`)
        if (!file) return validator

        const software = file as Software

        validator.validate(software.spawnProcess !== undefined, `File [${file.name}] is not a software.`)
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