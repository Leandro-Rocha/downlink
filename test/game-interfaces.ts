import { Resource, ResourceTypes } from '../src/core/resource'
import { NetworkInterface } from '../src/network-interfaces'




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






// function createPermanentProcess() {
//     const player = new Player('Hanolus')
//     const remoteServer = new Player('Hanolus')

//     const tracerV1 = new Program('TracerV1', 1000, { processor: 100, memory: 100 })
//     const antVirusV1 = new Program('AntivirusV1', 1000, { processor: 500, memory: 100, remoteConnection: false })

//     player.gateway.storage.files.push(tracerV1)
//     player.gateway.storage.files.push()
//     remoteServer.gateway.storage.files.push(new File('TargetFile', 1000))

//     // Run Tracer - Constant running process
//     const result = player.gateway.execute(tracerV1)

//     // expect(result.isSuccessful()).to.be.true
//     // expect(result.messages).to.have.lengthOf(0)
//     // expect(result.details).to.have.property('process')




//     // Run Anti-Virus - Process with work to do

//     // Connect to server - Instant action

//     // Download file - Multi resource process
// }

// function createFileTransferProcess() {
//     const player = new Player('Hanolus')
//     const remoteServer = new Player('Remote Hanolus')

//     const antVirusV1 = new Program('AntivirusV1', 1000, { processor: 500, memory: 100, remoteConnection: false })

//     const targetFile = new File('TargetFile', 1000)
//     remoteServer.gateway.storage.files.push(targetFile)

//     // Download file - Multi resource process

//     // const result = FileTransferFactory.create(player.gateway, remoteServer.gateway, targetFile)
//     // console.log(`createFileTransferProcess -> result`, result)
// }




