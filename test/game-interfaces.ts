import 'mocha'
import { expect } from 'chai'
import { Resource, ResourceTypes } from '../src/resource'
import { NetworkInterface } from '../src/network-interfaces'
// import { ResourceManager } from '../src/resource-manager'

describe('Game Interfaces',
    () => {
        // it('can create permanent process', createPermanentProcess)
        // it('can create file transfer process', createFileTransferProcess)
    })


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

class OperationResult<T> {
    private result: OperationStatus = OperationStatus.SUCCESS
    messages: string[] = []
    details!: T

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

// export class NetworkInterface extends Resource {
//     counter = 1

//     processes: NetworkProcess[] = []

//     constructor(name: string, type: ResourceTypes, capacity: number) {
//         super(name, type, capacity)
//     }

//     updateFairShare() {
//         const sortedProcesses = [...this.processes]
//             .sort((p1, p2) => p1.pair.getFreeCapacity() - p2.pair.getFreeCapacity())

//         var allocated = 0
//         var unused = 0
//         var allocationCount = 0

//         sortedProcesses.forEach(process => {
//             const pair = process.pair

//             const fairShare = process.getCapacity() + unused
//             const pairAllocation = pair.getOrientedAllocation(process) || pair.getFreeCapacity() + pair.networkLink.getUnusedAllocation() || pair.getCapacity()

//             // TODO change to optional chaining
//             const newAllocation = Math.min(fairShare, pairAllocation,
//                 // (process.bounceInfo || {}).sharedAllocation || Number.MAX_VALUE
//             )

//             allocated += newAllocation
//             allocationCount++
//             unused += fairShare - newAllocation

//             process.setOrientedAllocation(pair, newAllocation)

//             // console.log(`${process.pid}-${pair.pid}:${newAllocation}`)
//         })
//     }

//     getUnusedAllocation() {
//         const unused = this.processes
//             .filter(t => t.allocated > 0)
//             .reduce((acc, t) => acc += t.getCapacity() - t.allocated, 0)

//         if (unused < 0) {
//             console.log('!!!!!!!!!!!!!!!!!!')
//         }

//         return unused < 0 ? 0 : unused
//     }

// }


class Downlink extends NetworkInterface {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.DOWNLINK, capacity)
    }
}

class Uplink extends NetworkInterface {
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

// export class NetworkProcess extends Process {
//     networkLink: NetworkInterface
//     pair!: NetworkProcess
//     allocated: number
//     bounceInfo!: { sharedAllocation: number, chain: NetworkProcess[] }

//     constructor(pid: string, networkLink: NetworkInterface) {
//         super(pid)

//         this.pid = pid + networkLink.type + networkLink.counter++


//         this.networkLink = networkLink
//         this.allocated = 0
//     }

//     getSharedPriority() {
//         return this.networkLink.processes.reduce((acc, process) => acc += process.priority, 0)
//     }

//     getMyPriorityShare(): number {
//         return this.priority / this.getSharedPriority()
//     }

//     // getOrientedAllocation(consumer: NetworkProcess) {
//     //     return ResourceManager.resourceMatrix.getOrientedAllocation(`${this.pid}-${consumer.pid}`)
//     // }

//     // setOrientedAllocation(consumer: NetworkProcess, value: number) {
//     //     ResourceManager.resourceMatrix.setOrientedAllocation(`${this.pid}-${consumer.pid}`, value)
//     // }

//     // getOrientedAllocationOrFreeCapacity(consumer: NetworkProcess) {
//     //     const orientedAllocation = ResourceManager.resourceMatrix.getOrientedAllocation(`${this.pid}-${consumer.pid}`)
//     //     return orientedAllocation || consumer.getFreeCapacity()
//     // }

//     // updateFairShare() {
//     //     const sortedConsumers = [...this.getInterfaceConsumers().sort((c1, c2) => this.getOrientedAllocationOrFreeCapacity(c1) - this.getOrientedAllocationOrFreeCapacity(c2))]

//     //     const consumer = this.pair
//     //     const fairShare = (this.getCapacity()) + this.networkLink.getUnusedAllocation()
//     //     // / ((this.getInterfaceConsumers().length - allocationCount) || 1)

//     //     const maxAllocation = consumer.getOrientedAllocation(this)
//     //         || (consumer.getFreeCapacity() + consumer.networkLink.getUnusedAllocation())
//     //         || (consumer.getCapacity())

//     //     var newAllocation = Math.min(fairShare, maxAllocation)
//     //     // newAllocation = Math.min(newAllocation, this.bounceInfo.sharedAllocation)

//     //     // console.log(`${this.pid}-${consumer.pid}:${newAllocation}`)

//     //     this.setOrientedAllocation(consumer, newAllocation)
//     // }

//     allocate(amount: number) {
//         this.allocated += amount
//     }

//     free(amount: number) {
//         this.allocated -= amount
//     }

//     canAllocate(amount: number): boolean {
//         return amount + this.allocated <= this.getCapacity() + this.networkLink.getUnusedAllocation()
//     }

//     getCapacity(): number {
//         return (this.networkLink.capacity * this.getMyPriorityShare())
//     }

//     getFreeCapacity(): number {
//         return this.getCapacity() - this.allocated
//     }

//     getInterfaceTotalCapacity(): number {
//         return this.networkLink.capacity
//     }

//     // getInterfaceConsumers(): NetworkProcess[] {
//     //     return this.networkLink.processes
//     // }
// }

class Gateway {

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
            // validator.details.process = process
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

// type FileTransferDetails = { pairs: { downloadProcess: NetworkProcess, uploadProcess: NetworkProcess }[] }

// export enum FileTransferType {
//     DOWNLOAD = 'DOWNLOAD',
//     UPLOAD = 'UPLOAD'
// }

// export class FileTransferFactory {

//     static createFileTransfer(transferType: FileTransferType, file: File, ...connectionPath: Gateway[]): OperationResult<FileTransferDetails> {
//         const result = new OperationResult<FileTransferDetails>()
//         result.details = { pairs: [] }

//         result.validate(connectionPath.length > 1, `2 or more Gateways are required for a file transfer.`)
//         if (!result.isSuccessful()) return result

//         var workingConnectionPath = [...connectionPath]

//         if (transferType === FileTransferType.UPLOAD)
//             workingConnectionPath = workingConnectionPath.reverse()

//         const fileOwner = connectionPath[connectionPath.length - 1]
//         result.validate(fileOwner.storage.files.includes(file), `File [${file.name}] does not exists.`)
//         if (!result.isSuccessful()) return result

//         const bounceInfo: { sharedAllocation: number, chain: NetworkProcess[] } = { sharedAllocation: Number.MAX_VALUE, chain: [] }

//         while (workingConnectionPath.length > 1) {
//             const downloader = workingConnectionPath.shift()!
//             const uploader = workingConnectionPath[0]

//             const downloadProcess = new NetworkProcess(downloader.owner.name, downloader.downlink)
//             const uploadProcess = new NetworkProcess(uploader.owner.name, uploader.uplink)

//             downloadProcess.pair = uploadProcess
//             uploadProcess.pair = downloadProcess

//             result.details.pairs.push({ downloadProcess: downloadProcess, uploadProcess: uploadProcess })

//             if (connectionPath.length > 2) {
//                 bounceInfo.chain.push(downloadProcess)
//                 downloadProcess.bounceInfo = bounceInfo

//                 bounceInfo.chain.push(uploadProcess)
//                 uploadProcess.bounceInfo = bounceInfo
//             }

//             // downloader.downlink.processes.push(downloadProcess)
//             // downloader.processes.push(downloadProcess)

//             // uploader.uplink.processes.push(uploadProcess)
//             // uploader.processes.push(uploadProcess)

//             // ResourceManager.addToReallocation(downloader.downlink, uploader.uplink)
//         }

//         return result
//     }
// }


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
    const remoteServer = new Player('Remote Hanolus')

    const antVirusV1 = new Program('AntivirusV1', 1000, { processor: 500, memory: 100, remoteConnection: false })

    const targetFile = new File('TargetFile', 1000)
    remoteServer.gateway.storage.files.push(targetFile)

    // Download file - Multi resource process

    // const result = FileTransferFactory.create(player.gateway, remoteServer.gateway, targetFile)
    // console.log(`createFileTransferProcess -> result`, result)
}




