import 'mocha'
import { expect } from 'chai'
import { File } from './game-interfaces'
import { Types } from '../src/common/types'
import { Downlink, FileTransferFactory, Uplink } from '../src/server/core/network-interfaces'
import { Gateway } from '../src/server/core/gateway'

var A: Gateway = new Gateway({ hostname: 'A' })
var B: Gateway = new Gateway({ hostname: 'B' })
var C: Gateway = new Gateway({ hostname: 'C' })
var X: Gateway = new Gateway({ hostname: 'X' })
var Y: Gateway = new Gateway({ hostname: 'Y' })
var Z: Gateway = new Gateway({ hostname: 'Z' })
const targetFile = new File('TargetFile', 1000)

describe('File Transfer Allocation',
    () => {

        beforeEach(function () {

            A = new Gateway({ hostname: 'A', uplink: new Uplink('AU', 1), downlink: new Downlink('AD', 1) })
            B = new Gateway({ hostname: 'B', uplink: new Uplink('BU', 1), downlink: new Downlink('BD', 1) })
            C = new Gateway({ hostname: 'C', uplink: new Uplink('CU', 1), downlink: new Downlink('CD', 1) })
            X = new Gateway({ hostname: 'X', uplink: new Uplink('XU', 1), downlink: new Downlink('XD', 1) })
            Y = new Gateway({ hostname: 'Y', uplink: new Uplink('YU', 1), downlink: new Downlink('YD', 1) })
            Z = new Gateway({ hostname: 'Z', uplink: new Uplink('ZU', 1), downlink: new Downlink('ZD', 1) })
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

function validateStream(stream: Types.Stream, bandWidth: number) {
    expect(stream.bandWidth, `Stream ${stream.description} bandwidth should be ${bandWidth} but was ${stream.bandWidth}`)
        .to.be.approximately(bandWidth, 0.001)

    expect(stream.upStreamer.bandWidth, `UpStreamer bandwidth should be ${bandWidth} but was ${stream.bandWidth}`)
        .to.be.approximately(bandWidth, 0.001)

    expect(stream.downStreamer.bandWidth, `DownStream bandwidth should be ${bandWidth} but was ${stream.bandWidth}`)
        .to.be.approximately(bandWidth, 0.001)
}


function singleDownloadSameCapacity() {
    const factory = new FileTransferFactory(targetFile, X, A)
    const result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 1)
}

function singleDownloadBoundByDownloader() {
    A.downlink.capacity = 0.5

    const factory = new FileTransferFactory(targetFile, X, A)
    const result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 0.5)
}

function singleDownloadBoundByUploader() {
    X.uplink.capacity = 0.5

    const factory = new FileTransferFactory(targetFile, X, A)
    const result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 0.5)
}

function twoDownloads() {

    // Starting download A =====================================
    var factory = new FileTransferFactory(targetFile, X, A)
    var result = factory.create()
    const { stream: streamXA } = result.details[0]

    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting download B =====================================
    var factory = new FileTransferFactory(targetFile, X, B)
    var result = factory.create()
    const { stream: streamXB } = result.details[0]

    streamXB.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB, 0.5)
}

function threeWithReallocation() {
    B.downlink.capacity = 0.5

    // Starting download X->A =====================================================================
    var factory = new FileTransferFactory(targetFile, X, A)
    var result = factory.create()
    const { stream: streamXA } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)


    // Starting first download X->B ===============================================================
    var factory = new FileTransferFactory(targetFile, X, B)
    var result = factory.create()
    const { stream: streamXB1 } = result.details[0]
    streamXB1.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB1, 0.5)

    // Starting second download X->B ==============================================================
    var factory = new FileTransferFactory(targetFile, X, B)
    var result = factory.create()
    const { stream: streamXB2, uploadProcess: XU3, downloadProcess: BD2 } = result.details[0]
    streamXB2.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB1, 0.25)
    validateStream(streamXB2, 0.25)
}

function threeWithReallocation2() {
    B.downlink.capacity = 0.5

    // Starting download X->A =====================================================================
    var factory = new FileTransferFactory(targetFile, X, A)
    var result = factory.create()
    const { stream: streamXA } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting first download X->B ===============================================================
    var factory = new FileTransferFactory(targetFile, X, B)
    var result = factory.create()
    const { stream: streamXB1 } = result.details[0]
    streamXB1.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB1, 0.5)

    // Starting download C->B =====================================================================
    var factory = new FileTransferFactory(targetFile, C, B)
    var result = factory.create()
    const { stream: streamCB1 } = result.details[0]
    streamCB1.updateBandwidth()

    validateStream(streamXA, 0.75)
    validateStream(streamXB1, 0.25)
    validateStream(streamCB1, 0.25)
}

function oneDownloadWithBounce() {
    var factory = new FileTransferFactory(targetFile, X, C, B, A)
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
    var factory = new FileTransferFactory(targetFile, X, C, B, A)
    var result = factory.create()
    const { stream: streamXC } = result.details[0]
    const { stream: streamCB } = result.details[1]
    const { stream: streamBA } = result.details[2]
    streamCB.updateBandwidth()

    validateStream(streamXC, 1)
    validateStream(streamCB, 1)
    validateStream(streamBA, 1)

    // Starting download Y->C =====================================================================
    var factory = new FileTransferFactory(targetFile, Y, C)
    var result = factory.create()
    const { stream: streamYC1 } = result.details[0]
    streamYC1.updateBandwidth()

    validateStream(streamXC, 0.5)
    validateStream(streamCB, 0.5)
    validateStream(streamBA, 0.5)
    validateStream(streamYC1, 0.5)

    // Starting download C->Y =====================================================================
    var factory = new FileTransferFactory(targetFile, C, Y)
    var result = factory.create()
    const { stream: streamCY1 } = result.details[0]
    streamCY1.updateBandwidth()

    validateStream(streamXC, 0.5)
    validateStream(streamCB, 0.5)
    validateStream(streamBA, 0.5)
    validateStream(streamYC1, 0.5)
    validateStream(streamCY1, 0.5)

    // Starting second download C->Y ==============================================================
    var factory = new FileTransferFactory(targetFile, C, Y)
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
    var factory = new FileTransferFactory(targetFile, X, A)
    var result = factory.create()
    const { stream: streamXA, uploadProcess: XU1 } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting download X->B =====================================================================
    var factory = new FileTransferFactory(targetFile, X, B)
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
    var factory = new FileTransferFactory(targetFile, X, A)
    var result = factory.create()
    const { stream: streamXA, uploadProcess: XU1, downloadProcess: AD } = result.details[0]
    streamXA.updateBandwidth()

    validateStream(streamXA, 1)

    // Starting download X->B =====================================================================
    var factory = new FileTransferFactory(targetFile, X, B)
    var result = factory.create()
    const { stream: streamXB } = result.details[0]
    streamXB.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXB, 0.5)

    // Stopping download X->A =====================================================================
    X.uplink.removeProcess(XU1)
    A.downlink.removeProcess(AD)

    streamXB.updateBandwidth()

    validateStream(streamXB, 1)

    // Starting download X->C =====================================================================
    var factory = new FileTransferFactory(targetFile, X, C)
    var result = factory.create()
    const { stream: streamXC } = result.details[0]
    streamXB.updateBandwidth()

    validateStream(streamXA, 0.5)
    validateStream(streamXC, 0.5)
}

function performance() {
    //     const numUploaders = 100
    //     const numDownloaders = 20

    //     var uploaders = []
    //     var downloaders = []

    //     for (let i = 0; i < numUploaders; i++) {
    //         uploaders.push(new Player(`U${i}`))
    //     }

    //     for (let i = 0; i < numDownloaders; i++) {
    //         downloaders.push(new Player(`U${i}`))
    //     }

    //     function randomInteger(min: number, max: number) {
    //         return Math.floor(Math.random() * (max - min + 1)) + min;
    //     }

    //     for (let i = 0; i < 2000; i++) {
    //         const upIndex = randomInteger(0, numUploaders - 1)
    //         const downIndex = randomInteger(0, numDownloaders - 1)

    //         var factory = new FileTransferFactory(targetFile, uploaders[upIndex], downloaders[downIndex])
    //         var result = factory.create()
    //         const { stream } = result.details[0]
    //         stream.updateBandwidth()
    //     }

    // for (let i = 0; i < numUploaders; i++) {
    //     console.log(`Uploader:${i}`)

    //     for (let j = 0; j < numDownloaders; j++) {
    //         const uploader = uploaders[i]
    //         const downloader = downloaders[j]

    //         const result = FileTransferFactory.create(targetFile, uploader, downloader)
    //         const { stream } = result.details[0]
    //         stream.updateBandwidth()
    //     }
    // }
}
