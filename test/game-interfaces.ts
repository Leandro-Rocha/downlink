import 'mocha'
import { expect } from 'chai'
import { ResourceManager } from '../src/resource-manager'

describe('Game Interfaces',
    () => {
        // it('can create permanent process', createPermanentProcess)
        // it('can create file transfer process', createFileTransferProcess)
    })

enum ResourceTypes {
    DOWNLINK = 'DOWNLINK',
    UPLINK = 'UPLINK',
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
    consumers: Resource[]

    constructor(name: string, type: ResourceTypes, capacity: number) {
        this.name = name
        this.type = type
        this.capacity = capacity
        this.allocated = 0
        this.consumers = []
    }

    allocate(desiredAllocation: number) {
        this.allocated += desiredAllocation
    }

    free(amount: number) {
        this.allocated -= amount
    }

    canAllocate(amount: number): boolean {
        return amount + this.allocated <= this.capacity
    }

    freeCapacity() {
        return this.capacity - this.allocated
    }

    addConsumer(consumer: Resource) {
        this.consumers.push(consumer)
    }

    removeConsumer(consumer: Resource) {
        this.consumers = this.consumers.filter(c => c !== consumer)
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

export class File implements Storable {
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

class Cpu extends Resource {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.CPU, capacity)
    }
}

class Memory extends Resource {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.MEMORY, capacity)
    }
}

class NetworkLink extends Resource {
    transfers: NetworkProcess[] = []

    constructor(name: string, type: ResourceTypes, capacity: number) {
        super(name, type, capacity)
    }

    getUnusedAllocation() {
        const unused = this.transfers
            .filter(t => t.allocated > 0)
            .reduce((acc, t) => acc += t.getCapacity() - t.allocated, 0)

        if (unused < 0) {
            console.log('!!!!!!!!!!!!!!!!!!')
        }

        return unused < 0 ? 0 : unused
    }
}


class Downlink extends NetworkLink {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.DOWNLINK, capacity)
    }
}

class Uplink extends NetworkLink {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.UPLINK, capacity)
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

export class NetworkProcess extends Process {
    networkLink: NetworkLink
    pair!: NetworkProcess
    allocated: number
    bounceInfo!: { sharedAllocation: number, chain: NetworkProcess[] }

    constructor(pid: string, networkLink: NetworkLink) {
        super(pid)
        this.networkLink = networkLink
        this.allocated = 0
    }

    getSharedPriority() {
        return this.networkLink.transfers.reduce((acc, process) => acc += process.priority, 0)
    }

    getMyPriorityShare(): number {
        return this.priority / this.getSharedPriority()
    }

    getOrientedAllocation(consumer: NetworkProcess) {
        return ResourceManager.resourceMatrix.getOrientedAllocation(`${this.pid}-${consumer.pid}`)
    }

    setOrientedAllocation(consumer: NetworkProcess, value: number) {
        ResourceManager.resourceMatrix.setOrientedAllocation(`${this.pid}-${consumer.pid}`, value)
    }

    getOrientedAllocationOrFreeCapacity(consumer: NetworkProcess) {
        const orientedAllocation = ResourceManager.resourceMatrix.getOrientedAllocation(`${this.pid}-${consumer.pid}`)
        return orientedAllocation || consumer.networkLink.freeCapacity()
    }

    updateFairShare() {
        const sortedConsumers = [...this.getInterfaceConsumers().sort((c1, c2) => this.getOrientedAllocationOrFreeCapacity(c1) - this.getOrientedAllocationOrFreeCapacity(c2))]

        const consumer = this.pair
        const fairShare = (this.getCapacity()) + this.networkLink.getUnusedAllocation()
        // / ((this.getInterfaceConsumers().length - allocationCount) || 1)

        const maxAllocation = consumer.getOrientedAllocation(this)
            || (consumer.getFreeCapacity() + consumer.networkLink.getUnusedAllocation())
            || (consumer.getCapacity())

        var newAllocation = Math.min(fairShare, maxAllocation)
        // newAllocation = Math.min(newAllocation, this.bounceInfo.sharedAllocation)

        // console.log(`${this.pid}-${consumer.pid}:${newAllocation}`)

        this.setOrientedAllocation(consumer, newAllocation)
    }

    canAllocate(amount: number): boolean {
        return amount + this.allocated <= this.getCapacity() + this.networkLink.getUnusedAllocation()
    }

    getCapacity(): number {
        return (this.networkLink.capacity * this.getMyPriorityShare())
    }

    getFreeCapacity(): number {
        return this.getCapacity() - this.allocated
    }

    getInterfaceTotalCapacity(): number {
        return this.networkLink.capacity
    }

    getInterfaceConsumers(): NetworkProcess[] {
        return this.networkLink.transfers
    }
}

class Gateway {

    counter = 1

    owner: Player

    ip: string

    storage: Storage = new Storage('HDD', 10000)
    processor: Cpu = new Cpu('Pentium3', 1000)
    memory: Memory = new Memory('PCchits', 2000)
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

export class Player {
    name: string
    gateway: Gateway

    constructor(name: string) {
        this.name = name
        this.gateway = new Gateway(this, '127.0.0.1')
    }
}

export class FileTransferFactory {
    static create(file: File, ...bounce: Gateway[]) {
        const result = new OperationResult()

        const bounceInfo: { sharedAllocation: number, chain: NetworkProcess[] } = { sharedAllocation: Number.MAX_VALUE, chain: [] }

        while (bounce.length > 1) {
            const downloader = bounce.shift()
            const uploader = bounce[0]

            if (downloader === undefined) return

            console.log(`${downloader.owner.name}...${uploader.owner.name}`)

            result.validate(uploader.storage.files.includes(file), `File ${file.name} does not exists.`)

            const downloadProcess = new NetworkProcess(downloader.owner.name + '_' + downloader.downlink.type + downloader.counter++, downloader.downlink)
            const uploadProcess = new NetworkProcess(uploader.owner.name + '_' + uploader.uplink.type + uploader.counter++, uploader.uplink)

            downloadProcess.pair = uploadProcess
            bounceInfo.chain.push(downloadProcess)
            downloadProcess.bounceInfo = bounceInfo

            uploadProcess.pair = downloadProcess
            bounceInfo.chain.push(uploadProcess)
            uploadProcess.bounceInfo = bounceInfo

            downloader.downlink.transfers.push(downloadProcess)
            downloader.processes.push(downloadProcess)
            downloader.processes.push(downloadProcess)
            result.details.downloadProcess = downloadProcess

            uploader.uplink.transfers.push(uploadProcess)
            uploader.processes.push(uploadProcess)
            result.details.uploadProcess = uploadProcess

            ResourceManager.reallocationList.push(...downloader.downlink.transfers, ...uploader.uplink.transfers)

        }


        return result
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

function createFileTransferProcess() {
    const player = new Player('Hanolus')
    const remoteServer = new Player('Hanolus')

    const antVirusV1 = new Program('AntivirusV1', 1000, { processor: 500, memory: 100, remoteConnection: false })

    const targetFile = new File('TargetFile', 1000)
    remoteServer.gateway.storage.files.push(targetFile)

    // Download file - Multi resource process

    // const result = FileTransferFactory.create(player.gateway, remoteServer.gateway, targetFile)
    // console.log(`createFileTransferProcess -> result`, result)


}