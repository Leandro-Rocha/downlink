import 'mocha'
import { expect } from 'chai'

describe('Game Interfaces',
    () => {
        it('can create permanent process', createPermanentProcess)
    })

enum ResourceTypes {
    NETWORK = 'NETWORK',
    PROCESSOR = 'PROCESSOR',
    MEMORY = 'MEMORY',
    CPU = 'CPU',
    STORAGE = 'CPU',
}

enum ConnectionStatus {
    KNOWN = 'KNOWN',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
}

enum AccessPrivileges {
    LOG = 'LOG',
    FTP = 'FTP',
    SSH = 'SSH',
    ROOT = 'ROOT',
}

enum OperationStatus {
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
}

class OperationResult {
    private result: OperationStatus = OperationStatus.SUCCESS
    messages: string[] = []
    details: { [propName: string]: any } = {}

    validate(condition: boolean, message: string) {
        if (!condition) {
            this.result = OperationStatus.FAIL
            this.messages.push(message)
        }
    }

    isSuccessful() {
        return this.result === OperationStatus.SUCCESS
    }
}

class Resource {
    name: string
    type: ResourceTypes
    capacity: number
    allocated: number

    constructor(name: string, type: ResourceTypes, capacity: number) {
        this.name = name
        this.type = type
        this.capacity = capacity
        this.allocated = 0
    }

    canAllocate(amount: number): boolean {
        return amount + this.allocated <= this.capacity
    }
}

class Storage extends Resource {
    files: File[] = []

    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.STORAGE, capacity)
    }
}

interface Storable {
    name: string
    size: number
}

interface ExecutableRequirement {
    processor: number
    memory: number
    remoteConnection?: boolean
}

class File implements Storable {
    name: string
    size: number

    constructor(name: string, size: number) {
        this.name = name
        this.size = size
    }
}


class Program extends File {
    requirements: ExecutableRequirement

    constructor(name: string, size: number, requirements: ExecutableRequirement) {
        super(name, size)

        this.requirements = requirements
    }

}

class Processor extends Resource {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.PROCESSOR, capacity)
    }
}

class Memory extends Resource {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.MEMORY, capacity)
    }
}

interface RemoteConnection {
    gateway?: Gateway
    status: ConnectionStatus
    privileges?: AccessPrivileges[]
}

class Process {
    pid: string
    priority: number

    constructor(pid: string) {
        this.pid = pid
        this.priority = 5
    }
}

class Gateway {
    ip: string
    storage: Storage = new Storage('HDD', 10000)
    processor: Processor = new Processor('Pentium3', 1000)
    memory: Memory = new Memory('PCchits', 2000)
    remoteConnection: RemoteConnection

    processes: Process[]

    constructor(ip: string) {
        this.ip = ip
        this.remoteConnection = { status: ConnectionStatus.DISCONNECTED }
        this.processes = []
    }

    execute(program: Program) {
        const requirements = program.requirements
        const validator = new OperationResult()

        validator.validate(this.memory.canAllocate(requirements.memory)
            , `Not enough memory. You need ${requirements.memory + this.memory.allocated - this.memory.capacity} more.`)

        validator.validate(requirements.remoteConnection !== true || this.remoteConnection.status === ConnectionStatus.CONNECTED
            , `A connection to a remote server is required`)

        if (validator.isSuccessful()) {
            const process = new Process('123')
            this.processes.push(process)
            validator.details.process = process
        }

        return validator
    }
}

class Player {
    name: String
    gateway: Gateway = new Gateway('127.0.0.1')

    constructor(name: string) {
        this.name = name
    }
}


function createPermanentProcess() {
    const player = new Player('Hanolus')
    const remoteServer = new Player('Hanolus')

    const tracerV1 = new Program('TracerV1', 1000, { processor: 100, memory: 100 })
    const antVirusV1 = new Program('AntivirusV1', 1000, { processor: 500, memory: 100, remoteConnection: false })

    player.gateway.storage.files.push(tracerV1)
    player.gateway.storage.files.push()
    remoteServer.gateway.storage.files.push(new File('TargetFile', 1000))

    // Run Tracer - Constant running process
    const result = player.gateway.execute(tracerV1)









    expect(result.isSuccessful()).to.be.true
    expect(result.messages).to.have.lengthOf(0)
    expect(result.details).to.have.property('process')




    // Run Anti-Virus - Process with work to do

    // Connect to server - Instant action

    // Download file - Multi resource process



}