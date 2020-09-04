import { expect } from "chai"
import 'mocha'
import { ResourceManager, ResourceMatrix } from "../src/resource-manager"
import { File, Player, FileTransferFactory, NetworkProcess } from "./game-interfaces"


var A: Player = new Player('A')
var B: Player = new Player('B')
var C: Player = new Player('C')
var X: Player = new Player('X')
var Y: Player = new Player('Y')
var Z: Player = new Player('Z')
const targetFile = new File('TargetFile', 1000)

describe('File Transfer Allocation',
    () => {
        beforeEach(function () {
            ResourceManager.resourceMatrix = new ResourceMatrix()

            // A = new Player('A')
            // B = new Player('B')
            // C = new Player('C')
            // X = new Player('X')
            // Y = new Player('Y')
            // Z = new Player('Z')
        })

        // it('can allocate single download', singleDownload)
        // it('can allocate two download', twoDownloads)
        it('can allocate tree downloads with reallocation', threeWithReallocation)
    })

const rm = ResourceManager
function singleDownload() {
    const result = FileTransferFactory.create(targetFile, A.gateway, X.gateway)

    const downloadProcess: NetworkProcess = result!.details.downloadProcess
    const uploadProcess: NetworkProcess = result!.details.uploadProcess

    ResourceManager.processReallocationList()

    expect(downloadProcess.allocated).to.be.equal(1)
    expect(uploadProcess.allocated).to.be.equal(1)
}

function twoDownloads() {
    var result = FileTransferFactory.create(targetFile, A.gateway, X.gateway)
    const downloadProcess1: NetworkProcess = result!.details.downloadProcess
    const uploadProcess1: NetworkProcess = result!.details.uploadProcess

    result = FileTransferFactory.create(targetFile, B.gateway, X.gateway)
    const downloadProcess2: NetworkProcess = result!.details.downloadProcess
    const uploadProcess2: NetworkProcess = result!.details.uploadProcess

    ResourceManager.processReallocationList()

    expect(downloadProcess1.allocated).to.be.equal(0.5)
    expect(uploadProcess1.allocated).to.be.equal(0.5)

    expect(downloadProcess2.allocated).to.be.equal(0.5)
    expect(uploadProcess2.allocated).to.be.equal(0.5)


    console.log(rm.resourceMatrix)
}

function threeWithReallocation() {
    var result = FileTransferFactory.create(targetFile, A.gateway, X.gateway)
    const downloadProcess1: NetworkProcess = result!.details.downloadProcess
    const uploadProcess1: NetworkProcess = result!.details.uploadProcess

    ResourceManager.processReallocationList()

    result = FileTransferFactory.create(targetFile, B.gateway, X.gateway)
    const downloadProcess2: NetworkProcess = result!.details.downloadProcess
    const uploadProcess2: NetworkProcess = result!.details.uploadProcess

    ResourceManager.processReallocationList()

    console.log(rm.resourceMatrix)

}