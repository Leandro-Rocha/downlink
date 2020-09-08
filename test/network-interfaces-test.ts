import 'mocha'
import { expect } from 'chai'
import { Player } from '../src/core/player'
import { Stream, FileTransferFactory } from '../src/core/network-interfaces'
import { File } from './game-interfaces'

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

            A = new Player('A')
            B = new Player('B')
            C = new Player('C')
            X = new Player('X')
            Y = new Player('Y')
            Z = new Player('Z')
        })

        it('can allocate single download with same capacities', singleDownloadSameCapacity)
        it('can allocate single download bounded by downloader', singleDownloadBoundByDownloader)
        it('can allocate single download bounded by uploader', singleDownloadBoundByUploader)
        it('can allocate two downloads', twoDownloads)
        it('can allocate two downloads with different priorities', twoDownloadsWithDifferentPriorities)
        it('can allocate two downloads and then remove one', downloadRemoval)
        it('can allocate three downloads with reallocation', threeWithReallocation)
        it('can allocate three downloads with reallocation 2', threeWithReallocation2)
        it('can allocate one download with bounce', oneDownloadWithBounce)
        it('can allocate two download with bounce limited by other download', twoDownloadWithBounce)
        // it('performance', performance).timeout(20000);
    })

function validateStream(stream: Stream, bandWidth: number) {
    expect(stream.bandWidth, `Stream ${stream.description} bandwidth should be ${bandWidth} but was ${stream.bandWidth}`)
        .to.be.approximately(bandWidth, 0.001)

    expect(stream.upStreamer.bandWidth, `UpStreamer bandwidth should be ${bandWidth} but was ${stream.bandWidth}`)
        .to.be.approximately(bandWidth, 0.001)

    expect(stream.downStreamer.bandWidth, `DownStream bandwidth should be ${bandWidth} but was ${stream.bandWidth}`)
        .to.be.approximately(bandWidth, 0.001)
}


function singleDownloadSameCapacity() {
    const factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    const result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 1)
}

function singleDownloadBoundByDownloader() {
    A.gateway.downlink.capacity = 0.5

    const factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    const result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 0.5)
}

function singleDownloadBoundByUploader() {
    X.gateway.uplink.capacity = 0.5

    const factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    const result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 0.5)
}

function twoDownloads() {

    // Starting download A =====================================
    var factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    var result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting download B =====================================
    var factory = new FileTransferFactory(targetFile, X.gateway, B.gateway)
    var result = factory.create()
    const { stream: streamXB } = result.details[0]

    streamXB.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB, 0.5)
}

function threeWithReallocation() {
    B.gateway.downlink.capacity = 0.5

    // Starting download X->A =====================================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    var result = factory.create()
    const { stream: streamXA } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)


    // Starting first download X->B ===============================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, B.gateway)
    var result = factory.create()
    const { stream: streamXB1 } = result.details[0]
    streamXB1.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB1, 0.5)

    // Starting second download X->B ==============================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, B.gateway)
    var result = factory.create()
    const { stream: streamXB2, uploadProcess: XU3, downloadProcess: BD2 } = result.details[0]
    streamXB2.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB1, 0.25)
    validateStream(streamXB2, 0.25)
}

function threeWithReallocation2() {
    B.gateway.downlink.capacity = 0.5

    // Starting download X->A =====================================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    var result = factory.create()
    const { stream: streamXA } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting first download X->B ===============================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, B.gateway)
    var result = factory.create()
    const { stream: streamXB1 } = result.details[0]
    streamXB1.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB1, 0.5)

    // Starting download C->B =====================================================================
    var factory = new FileTransferFactory(targetFile, C.gateway, B.gateway)
    var result = factory.create()
    const { stream: streamCB1 } = result.details[0]
    streamCB1.updateBandwidth()

    validateStream(streamXA, 0.75)
    validateStream(streamXB1, 0.25)
    validateStream(streamCB1, 0.25)
}

function oneDownloadWithBounce() {
    var factory = new FileTransferFactory(targetFile, X.gateway, C.gateway, B.gateway, A.gateway)
    var result = factory.create()
    const { stream: streamXC } = result.details[0]
    const { stream: streamCB } = result.details[1]
    const { stream: streamBA } = result.details[2]
    streamXC.updateBandwidth()

    validateStream(streamXC, 1)
    validateStream(streamCB, 1)
    validateStream(streamBA, 1)
}


function twoDownloadWithBounce() {

    // Starting download X->C->B->A ===============================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, C.gateway, B.gateway, A.gateway)
    var result = factory.create()
    const { stream: streamXC } = result.details[0]
    const { stream: streamCB } = result.details[1]
    const { stream: streamBA } = result.details[2]
    streamCB.updateBandwidth()

    validateStream(streamXC, 1)
    validateStream(streamCB, 1)
    validateStream(streamBA, 1)

    // Starting download Y->C =====================================================================
    var factory = new FileTransferFactory(targetFile, Y.gateway, C.gateway)
    var result = factory.create()
    const { stream: streamYC1 } = result.details[0]
    streamYC1.updateBandwidth()

    validateStream(streamXC, 0.5)
    validateStream(streamCB, 0.5)
    validateStream(streamBA, 0.5)
    validateStream(streamYC1, 0.5)

    // Starting download C->Y =====================================================================
    var factory = new FileTransferFactory(targetFile, C.gateway, Y.gateway)
    var result = factory.create()
    const { stream: streamCY1 } = result.details[0]
    streamCY1.updateBandwidth()

    validateStream(streamXC, 0.5)
    validateStream(streamCB, 0.5)
    validateStream(streamBA, 0.5)
    validateStream(streamYC1, 0.5)
    validateStream(streamCY1, 0.5)

    // Starting second download C->Y ==============================================================
    var factory = new FileTransferFactory(targetFile, C.gateway, Y.gateway)
    var result = factory.create()
    const { stream: streamCY2 } = result.details[0]
    streamCY2.updateBandwidth()

    validateStream(streamXC, 0.333)
    validateStream(streamCB, 0.333)
    validateStream(streamBA, 0.333)
    validateStream(streamYC1, 0.666)
    validateStream(streamCY1, 0.333)
    validateStream(streamCY2, 0.333)
}

function twoDownloadsWithDifferentPriorities() {
    // Starting download X->A =====================================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    var result = factory.create()
    const { stream: streamXA, uploadProcess: XU1 } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting download X->B =====================================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, B.gateway)
    var result = factory.create()
    const { stream: streamXB, uploadProcess: XU2 } = result.details[0]

    XU1.priority = 7
    XU2.priority = 3

    streamXB.updateBandwidth()

    validateStream(streamXA, 0.7)
    validateStream(streamXB, 0.3)
}

function downloadRemoval() {
    // Starting download X->A =====================================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, A.gateway)
    var result = factory.create()
    const { stream: streamXA, uploadProcess: XU1, downloadProcess: AD } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting download X->B =====================================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, B.gateway)
    var result = factory.create()
    const { stream: streamXB } = result.details[0]
    streamXB.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB, 0.5)

    // Stopping download X->A =====================================================================
    X.gateway.uplink.removeProcess(XU1)
    A.gateway.downlink.removeProcess(AD)

    streamXB.updateBandwidth()

    validateStream(streamXB, 1)

    // Starting download X->C =====================================================================
    var factory = new FileTransferFactory(targetFile, X.gateway, C.gateway)
    var result = factory.create()
    const { stream: streamXC } = result.details[0]
    streamXB.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXC, 0.5)
}

function performance() {
    const numUploaders = 100
    const numDownloaders = 20

    var uploaders = []
    var downloaders = []

    for (let i = 0; i < numUploaders; i++) {
        uploaders.push(new Player(`U${i}`))
    }

    for (let i = 0; i < numDownloaders; i++) {
        downloaders.push(new Player(`U${i}`))
    }

    function randomInteger(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for (let i = 0; i < 2000; i++) {
        const upIndex = randomInteger(0, numUploaders - 1)
        const downIndex = randomInteger(0, numDownloaders - 1)

        var factory = new FileTransferFactory(targetFile, uploaders[upIndex].gateway, downloaders[downIndex].gateway)
        var result = factory.create()
        const { stream } = result.details[0]
        stream.updateBandwidth()
    }

    // for (let i = 0; i < numUploaders; i++) {
    //     console.log(`Uploader:${i}`)

    //     for (let j = 0; j < numDownloaders; j++) {
    //         const uploader = uploaders[i]
    //         const downloader = downloaders[j]

    //         const result = FileTransferFactory.create(targetFile, uploader.gateway, downloader.gateway)
    //         const { stream } = result.details[0]
    //         stream.updateBandwidth()
    //     }
    // }
}
