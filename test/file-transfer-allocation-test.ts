import { expect } from "chai"
import 'mocha'
import { ResourceManager, ResourceMatrix } from "../src/resource-manager"
import { File, Player, FileTransferFactory, NetworkProcess, FileTransferType } from "./game-interfaces"


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

            A = new Player('A')
            B = new Player('B')
            C = new Player('C')
            X = new Player('X')
            Y = new Player('Y')
            Z = new Player('Z')

            A.gateway.storage.files.push(targetFile)
            B.gateway.storage.files.push(targetFile)
            C.gateway.storage.files.push(targetFile)
            X.gateway.storage.files.push(targetFile)
            Y.gateway.storage.files.push(targetFile)
            Z.gateway.storage.files.push(targetFile)
        })

        // it('can allocate fair share', fairShare)
        // it('can allocate single download with same capacities', singleDownloadSameCapacity)
        // it('can allocate single download bounded by downloader', singleDownloadBoundByDownloader)
        // it('can allocate single download bounded by uploader', singleDownloadBoundByUploader)
        // it('can allocate two downloads', twoDownloads)
        // it('can allocate tree downloads with reallocation', threeWithReallocation)
        // it('can allocate one download with bounce', oneDownloadWithBounce)
        it('can allocate two download with bounce limited by other download', twoDownloadWithBounce)
    })

const rm = ResourceManager
function singleDownloadSameCapacity() {
    const result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, X.gateway)
    const pairs = result.details.pairs

    expect(pairs).to.have.lengthOf(1)

    ResourceManager.processReallocationList()

    expect(pairs[0].downloadProcess.allocated).to.be.equal(1)
    expect(pairs[0].uploadProcess.allocated).to.be.equal(1)
}

function singleDownloadBoundByDownloader() {
    A.gateway.downlink.capacity = 0.5
    const result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, X.gateway)
    const pairs = result.details.pairs

    expect(pairs).to.have.lengthOf(1)

    ResourceManager.processReallocationList()

    expect(pairs[0].downloadProcess.allocated).to.be.equal(0.5)
    expect(pairs[0].uploadProcess.allocated).to.be.equal(0.5)
}

function singleDownloadBoundByUploader() {
    X.gateway.uplink.capacity = 0.5
    const result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, X.gateway)
    const pairs = result.details.pairs

    expect(pairs).to.have.lengthOf(1)

    ResourceManager.processReallocationList()

    expect(pairs[0].downloadProcess.allocated).to.be.equal(0.5)
    expect(pairs[0].uploadProcess.allocated).to.be.equal(0.5)
}

function twoDownloads() {
    var result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, X.gateway)
    var pairs = result.details.pairs
    expect(pairs).to.have.lengthOf(1)
    const downloadProcess1 = pairs[0].downloadProcess
    const uploadProcess1 = pairs[0].uploadProcess

    result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, B.gateway, X.gateway)
    var pairs = result.details.pairs
    expect(pairs).to.have.lengthOf(1)
    const downloadProcess2 = pairs[0].downloadProcess
    const uploadProcess2 = pairs[0].uploadProcess

    ResourceManager.processReallocationList()

    expect(downloadProcess1.allocated).to.be.equal(0.5)
    expect(uploadProcess1.allocated).to.be.equal(0.5)

    expect(downloadProcess2.allocated).to.be.equal(0.5)
    expect(uploadProcess2.allocated).to.be.equal(0.5)
}

function threeWithReallocation() {

    B.gateway.downlink.capacity = 0.5
    var result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, X.gateway)
    var pairs = result.details.pairs
    expect(pairs).to.have.lengthOf(1)
    const downloadProcess1 = pairs[0].downloadProcess
    const uploadProcess1 = pairs[0].uploadProcess

    result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, B.gateway, X.gateway)
    var pairs = result.details.pairs
    expect(pairs).to.have.lengthOf(1)
    const downloadProcess2 = pairs[0].downloadProcess
    const uploadProcess2 = pairs[0].uploadProcess

    result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, B.gateway, Y.gateway)
    var pairs = result.details.pairs
    expect(pairs).to.have.lengthOf(1)
    const downloadProcess3 = pairs[0].downloadProcess
    const uploadProcess3 = pairs[0].uploadProcess

    ResourceManager.processReallocationList()

    expect(downloadProcess1.allocated)
        .to.be.equal(uploadProcess1.allocated)
        .to.be.equal(0.75)

    expect(downloadProcess2.allocated)
        .to.be.equal(uploadProcess2.allocated)
        .to.be.equal(0.25)

    expect(downloadProcess3.allocated)
        .to.be.equal(uploadProcess3.allocated)
        .to.be.equal(0.25)
}

function oneDownloadWithBounce() {
    var result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, B.gateway, C.gateway, X.gateway, Y.gateway)
    var pairs = result.details.pairs
    expect(pairs).to.have.lengthOf(4)

    ResourceManager.processReallocationList()

    expect(1)
        .to.be.equal(pairs[0].downloadProcess.allocated)
        .to.be.equal(pairs[0].uploadProcess.allocated)

        .to.be.equal(pairs[1].downloadProcess.allocated)
        .to.be.equal(pairs[1].uploadProcess.allocated)

        .to.be.equal(pairs[2].downloadProcess.allocated)
        .to.be.equal(pairs[2].uploadProcess.allocated)

        .to.be.equal(pairs[3].downloadProcess.allocated)
        .to.be.equal(pairs[3].uploadProcess.allocated)
}

function twoDownloadWithBounce() {
    // C.gateway.downlink.capacity = 2

    const result1 = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, B.gateway, C.gateway)
    const pairs1 = result1.details.pairs
    // expect(pairs1).to.have.lengthOf(4)

    const result2 = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, X.gateway, B.gateway, Y.gateway)
    FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, Z.gateway, C.gateway)
    FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, Z.gateway, C.gateway)
    const pairs2 = result2.details.pairs
    // expect(pairs2).to.have.lengthOf(1)

    ResourceManager.processReallocationList()

    console.log(rm.resourceMatrix)

    // expect(0.5)
    //     .to.be.equal(pairs1[0].downloadProcess.allocated)
    //     .to.be.equal(pairs1[0].uploadProcess.allocated)

    //     .to.be.equal(pairs1[1].downloadProcess.allocated)
    //     .to.be.equal(pairs1[1].uploadProcess.allocated)

    //     .to.be.equal(pairs1[2].downloadProcess.allocated)
    //     .to.be.equal(pairs1[2].uploadProcess.allocated)

    //     .to.be.equal(pairs1[3].downloadProcess.allocated)
    //     .to.be.equal(pairs1[3].uploadProcess.allocated)

    //     .to.be.equal(pairs2[0].downloadProcess.allocated)
    //     .to.be.equal(pairs2[0].uploadProcess.allocated)
}


function fairShare() {
    var result = FileTransferFactory.createFileTransfer(FileTransferType.DOWNLOAD, targetFile, A.gateway, X.gateway)

    ResourceManager.processReallocationList()

    console.log(rm.resourceMatrix)
}














