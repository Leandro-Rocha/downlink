import faker from 'faker'
import { Types } from "../../common/types"
import { ConnectionStatus } from '../../common/constants'
import { Downlink, RemoteConnection, Uplink } from "./network-interfaces"
import { Log } from './log'
import { Memory, Storage, CPU } from './resource'


export class Gateway implements Types.Gateway {

    id: string
    ip: string
    hostname: string

    storage: Types.Storage
    memory: Types.Resource
    cpu: Types.Resource
    downlink: Types.INetworkInterface
    uplink: Types.INetworkInterface

    processes: Types.Process[]
    users: Types.User[]
    log: Log

    outboundConnection: RemoteConnection
    inboundConnections: RemoteConnection[]

    //TODO: avoid collisions for id and ip
    constructor(config?: Partial<Gateway>) {
        this.id = config?.id || faker.random.uuid()
        this.ip = config?.ip || faker.internet.ip()
        this.hostname = config?.hostname || faker.internet.userName()

        this.storage = config?.storage || new Storage('Disco Severo', 1000)
        this.memory = config?.memory || new Memory('Rã', 1024)
        this.cpu = config?.cpu || new CPU('Pentelium III', 3000)

        this.downlink = config?.downlink || new Downlink('BR Robóticos', 14400)
        this.uplink = config?.uplink || new Uplink('BR Robóticos', 14400)

        this.processes = config?.processes || []
        this.users = config?.users || [{ userName: 'root', password: faker.internet.password() }]
        this.log = config?.log || new Log()

        this.outboundConnection = config?.outboundConnection || new RemoteConnection()
        this.inboundConnections = config?.inboundConnections || []
    }

    connectTo(remoteGateway: Types.Gateway) {

        this.outboundConnection.connect(remoteGateway)

        this.log.addEntry(`localhost connected to [${remoteGateway.ip}]`)
        remoteGateway.log.addEntry(`connection from [${this.ip}]`)

        console.debug(`[${this.hostname}] connected to [${remoteGateway.ip}] - [${remoteGateway.hostname}]`)
    }

    remoteLogin(loggedAs: string) {
        const remoteGateway = this.outboundConnection.gateway
        //TODO: sanity
        if (remoteGateway == undefined) return

        this.outboundConnection.status = ConnectionStatus.LOGGED
        this.outboundConnection.loggedAs = loggedAs

        this.log.addEntry(`localhost logged in to [${remoteGateway.ip}] as [${loggedAs}]`)
        remoteGateway.log.addEntry(`[${this.ip}] logged in as [${loggedAs}]`)
    }

    // execute(program: Program) {
    //     const requirements = program.requirements
    //     const validator = new OperationResult()

    //     validator.validate(this.memory.canAllocate(requirements.memory)
    //         , `Not enough memory. You need ${requirements.memory + this.memory.allocated - this.memory.capacity} more.`)

    //     validator.validate(requirements.remoteConnection !== true || this.remoteConnection.status === ConnectionStatus.CONNECTED
    //         , `A connection to a remote server is required`)

    //     if (validator.isSuccessful()) {
    //         const process = new Process('123')
    //         this.processes.push(process)
    //         // validator.details.process = process
    //     }

    //     return validator
    // }
}