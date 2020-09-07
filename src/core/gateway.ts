import { Player } from "./player"
import { Cpu, Memory, Storage } from "./resource"
import { Process } from "./process"
import { Downlink, Uplink, RemoteConnection, ConnectionStatus } from "../network-interfaces"

export class Gateway {

    owner: Player

    ip: string

    storage: Storage = new Storage('HDD', 10000)
    processor: Cpu = new Cpu('Pentium3', 1000)
    memory: Memory = new Memory('PCShits', 2000)
    downlink: Downlink = new Downlink('DL', 1)
    uplink: Uplink = new Uplink('UL', 1)
    remoteConnection: RemoteConnection

    processes: Process[]

    constructor(owner: Player, ip: string) {
        this.owner = owner
        this.ip = ip
        this.remoteConnection = { status: ConnectionStatus.DISCONNECTED }
        this.processes = []

        this.downlink = new Downlink(owner.name + 'DL', 1)
        this.uplink = new Uplink(owner.name + 'UL', 1)
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