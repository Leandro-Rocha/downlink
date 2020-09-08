import 'mocha'
import { expect } from 'chai'
import { SIGNALS } from '../src/core/signal'
import { Player } from '../src/core/player'
import { StreamerProcess } from '../src/core/process'
import { NetworkStream, BounceInfo, FileTransferFactory } from '../src/core/network-interfaces'
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

            // A.gateway.storage.files.push(targetFile)
            // B.gateway.storage.files.push(targetFile)
            // C.gateway.storage.files.push(targetFile)
            // X.gateway.storage.files.push(targetFile)
            // Y.gateway.storage.files.push(targetFile)
            // Z.gateway.storage.files.push(targetFile)
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
        it('performance', performance)
        it('bug', bug)
    })



function singleDownloadSameCapacity() {

    const result = FileTransferFactory.create(targetFile, X.gateway, A.gateway)
    const { stream: streamXA, uploadProcess: XU, downloadProcess: AD } = result.details[0]

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(XU.allocation).to.be.equal(1)
    expect(AD.allocation).to.be.equal(1)
}

function singleDownloadBoundByDownloader() {
    A.gateway.downlink.capacity = 0.5

    const AD = new StreamerProcess('', A.gateway.downlink)
    const XU = new StreamerProcess('', X.gateway.uplink)

    const streamXA = new NetworkStream(XU, AD)

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(AD.allocation).to.be.equal(0.5)
    expect(XU.allocation).to.be.equal(0.5)
}

function singleDownloadBoundByUploader() {
    X.gateway.uplink.capacity = 0.5

    const AD = new StreamerProcess('', A.gateway.downlink)
    const XU = new StreamerProcess('', X.gateway.uplink)

    const streamXA = new NetworkStream(XU, AD)

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(AD.allocation).to.be.equal(0.5)
    expect(XU.allocation).to.be.equal(0.5)
}

function twoDownloads() {

    // Starting download A =====================================
    var result = FileTransferFactory.create(targetFile, X.gateway, A.gateway)
    const { stream: streamXA, uploadProcess: XU1, downloadProcess: AD } = result.details[0]

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(AD.allocation).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)

    // Starting download B =====================================
    var result = FileTransferFactory.create(targetFile, X.gateway, B.gateway)
    const { stream: streamXB, uploadProcess: XU2, downloadProcess: BD } = result.details[0]
    streamXB.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(streamXB.bandWidth).to.be.equal(0.5)
    expect(AD.allocation).to.be.equal(0.5)
    expect(BD.allocation).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(XU2.allocation).to.be.equal(0.5)
}

function threeWithReallocation() {
    B.gateway.downlink.capacity = 0.5

    // Starting download A =====================================
    var result = FileTransferFactory.create(targetFile, X.gateway, A.gateway)
    const { stream: streamXA, uploadProcess: XU1, downloadProcess: AD1 } = result.details[0]
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)
    expect(AD1.allocation).to.be.equal(1)


    // Starting first download B ===============================
    var result = FileTransferFactory.create(targetFile, X.gateway, B.gateway)
    const { stream: streamXB1, uploadProcess: XU2, downloadProcess: BD1 } = result.details[0]
    streamXB1.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(AD1.allocation).to.be.equal(0.5)

    expect(streamXB1.bandWidth).to.be.equal(0.5)
    expect(XU2.allocation).to.be.equal(0.5)
    expect(BD1.allocation).to.be.equal(0.5)

    // Starting second download B ==============================
    var result = FileTransferFactory.create(targetFile, X.gateway, B.gateway)
    const { stream: streamXB2, uploadProcess: XU3, downloadProcess: BD2 } = result.details[0]
    streamXB2.updateBandwidth()

    expect(streamXA.bandWidth).to.be.approximately(0.5, 0.001)
    expect(XU1.allocation).to.be.approximately(0.5, 0.001)
    expect(AD1.allocation).to.be.approximately(0.5, 0.001)

    expect(streamXB1.bandWidth).to.be.equal(0.25)
    expect(XU2.allocation).to.be.equal(0.25)
    expect(BD1.allocation).to.be.equal(0.25)

    expect(streamXB2.bandWidth).to.be.equal(0.25)
    expect(XU3.allocation).to.be.equal(0.25)
    expect(BD2.allocation).to.be.equal(0.25)
}

function threeWithReallocation2() {
    B.gateway.downlink.capacity = 0.5

    // Starting download A =====================================
    var result = FileTransferFactory.create(targetFile, X.gateway, A.gateway)
    const { stream: streamXA, uploadProcess: XU1, downloadProcess: AD1 } = result.details[0]
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)
    expect(AD1.allocation).to.be.equal(1)

    // Starting first download B ===============================
    var result = FileTransferFactory.create(targetFile, X.gateway, B.gateway)
    const { stream: streamXB1, uploadProcess: XU2, downloadProcess: BD1 } = result.details[0]
    streamXB1.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(AD1.allocation).to.be.equal(0.5)

    expect(streamXB1.bandWidth).to.be.equal(0.5)
    expect(XU2.allocation).to.be.equal(0.5)
    expect(BD1.allocation).to.be.equal(0.5)

    // Starting second download B =============================
    var result = FileTransferFactory.create(targetFile, C.gateway, B.gateway)
    const { stream: streamCB1, uploadProcess: CU1, downloadProcess: BD2 } = result.details[0]
    streamCB1.updateBandwidth()

    expect(streamXA.bandWidth).to.be.approximately(0.75, 0.001)
    expect(XU1.allocation).to.be.approximately(0.75, 0.001)
    expect(AD1.allocation).to.be.approximately(0.75, 0.001)

    expect(streamXB1.bandWidth).to.be.equal(0.25)
    expect(XU2.allocation).to.be.equal(0.25)
    expect(BD1.allocation).to.be.equal(0.25)

    expect(streamCB1.bandWidth).to.be.equal(0.25)
    expect(CU1.allocation).to.be.equal(0.25)
    expect(BD2.allocation).to.be.equal(0.25)
}

function oneDownloadWithBounce() {

    var result = FileTransferFactory.create(targetFile, X.gateway, C.gateway, B.gateway, A.gateway)
    const { stream: streamXC, uploadProcess: XU1, downloadProcess: CD1 } = result.details[0]
    const { stream: streamCB, uploadProcess: CU1, downloadProcess: BD1 } = result.details[1]
    const { stream: streamBA, uploadProcess: BU1, downloadProcess: AD1 } = result.details[2]

    streamXC.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)
    expect(CD1.allocation).to.be.equal(1)

    expect(streamCB.bandWidth).to.be.equal(1)
    expect(CU1.allocation).to.be.equal(1)
    expect(BD1.allocation).to.be.equal(1)

    expect(streamBA.bandWidth).to.be.equal(1)
    expect(BU1.allocation).to.be.equal(1)
    expect(AD1.allocation).to.be.equal(1)
}


function twoDownloadWithBounce() {

    var result = FileTransferFactory.create(targetFile, X.gateway, C.gateway, B.gateway, A.gateway)
    const { stream: streamXC, uploadProcess: XU1, downloadProcess: CD1 } = result.details[0]
    const { stream: streamCB, uploadProcess: CU1, downloadProcess: BD1 } = result.details[1]
    const { stream: streamBA, uploadProcess: BU1, downloadProcess: AD1 } = result.details[2]

    streamXC.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)
    expect(CD1.allocation).to.be.equal(1)

    expect(streamCB.bandWidth).to.be.equal(1)
    expect(CU1.allocation).to.be.equal(1)
    expect(BD1.allocation).to.be.equal(1)

    expect(streamBA.bandWidth).to.be.equal(1)
    expect(BU1.allocation).to.be.equal(1)
    expect(AD1.allocation).to.be.equal(1)


    // Starting download Y->C ==================================
    var result = FileTransferFactory.create(targetFile, Y.gateway, C.gateway)
    const { stream: streamYC1, uploadProcess: YU1, downloadProcess: CD2 } = result.details[0]
    streamYC1.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(CD1.allocation).to.be.equal(0.5)

    expect(streamCB.bandWidth).to.be.equal(0.5)
    expect(CU1.allocation).to.be.equal(0.5)
    expect(BD1.allocation).to.be.equal(0.5)

    expect(streamBA.bandWidth).to.be.equal(0.5)
    expect(BU1.allocation).to.be.equal(0.5)
    expect(AD1.allocation).to.be.equal(0.5)

    expect(streamYC1.bandWidth).to.be.equal(0.5)
    expect(YU1.allocation).to.be.equal(0.5)
    expect(CD2.allocation).to.be.equal(0.5)

    // Starting download C->Y ==================================
    var result = FileTransferFactory.create(targetFile, C.gateway, Y.gateway)
    const { stream: streamCY1, uploadProcess: CU2, downloadProcess: YD1 } = result.details[0]
    streamCY1.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(CD1.allocation).to.be.equal(0.5)

    expect(streamCB.bandWidth).to.be.equal(0.5)
    expect(CU1.allocation).to.be.equal(0.5)
    expect(BD1.allocation).to.be.equal(0.5)

    expect(streamBA.bandWidth).to.be.equal(0.5)
    expect(BU1.allocation).to.be.equal(0.5)
    expect(AD1.allocation).to.be.equal(0.5)

    expect(streamYC1.bandWidth).to.be.equal(0.5)
    expect(YU1.allocation).to.be.equal(0.5)
    expect(CD2.allocation).to.be.equal(0.5)

    expect(streamCY1.bandWidth).to.be.equal(0.5)
    expect(CU2.allocation).to.be.equal(0.5)
    expect(YD1.allocation).to.be.equal(0.5)

    // Starting download C->Y ==================================
    var result = FileTransferFactory.create(targetFile, C.gateway, Y.gateway)
    const { stream: streamCY2, uploadProcess: CU3, downloadProcess: YD2 } = result.details[0]
    streamCY2.updateBandwidth()

    expect(streamXC.bandWidth).to.be.approximately(0.333, 0.001)
    expect(XU1.allocation).to.be.approximately(0.333, 0.001)
    expect(CD1.allocation).to.be.approximately(0.333, 0.001)

    expect(streamCB.bandWidth).to.be.approximately(0.333, 0.001)
    expect(CU1.allocation).to.be.approximately(0.333, 0.001)
    expect(BD1.allocation).to.be.approximately(0.333, 0.001)

    expect(streamBA.bandWidth).to.be.approximately(0.333, 0.001)
    expect(BU1.allocation).to.be.approximately(0.333, 0.001)
    expect(AD1.allocation).to.be.approximately(0.333, 0.001)

    expect(streamYC1.bandWidth).to.be.approximately(0.666, 0.001)
    expect(YU1.allocation).to.be.approximately(0.666, 0.001)
    expect(CD2.allocation).to.be.approximately(0.666, 0.001)

    expect(streamCY1.bandWidth).to.be.approximately(0.333, 0.001)
    expect(CU2.allocation).to.be.approximately(0.333, 0.001)
    expect(YD1.allocation).to.be.approximately(0.333, 0.001)

    expect(streamCY2.bandWidth).to.be.approximately(0.333, 0.001)
    expect(CU3.allocation).to.be.approximately(0.333, 0.001)
    expect(YD2.allocation).to.be.approximately(0.333, 0.001)
}

function twoDownloadsWithDifferentPriorities() {
    // Starting download XA ====================================
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const AD = new StreamerProcess('A', A.gateway.downlink)
    const streamXA = new NetworkStream(XU1, AD)
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(AD.allocation).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)

    // Starting download XB ====================================
    const XU2 = new StreamerProcess('X', X.gateway.uplink)
    const BD = new StreamerProcess('B', B.gateway.downlink)
    const streamXB = new NetworkStream(XU2, BD)
    XU1.priority = 7
    XU2.priority = 3

    streamXB.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.7)
    expect(XU1.allocation).to.be.equal(0.7)
    expect(AD.allocation).to.be.equal(0.7)

    expect(streamXB.bandWidth).to.be.equal(0.3)
    expect(XU2.allocation).to.be.equal(0.3)
    expect(BD.allocation).to.be.equal(0.3)
}

function downloadRemoval() {
    // Starting download XA ====================================
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const AD = new StreamerProcess('A', A.gateway.downlink)
    var streamXA = new NetworkStream(XU1, AD)
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(AD.allocation).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)

    // Starting download XB ====================================
    const XU2 = new StreamerProcess('X', X.gateway.uplink)
    const BD = new StreamerProcess('B', B.gateway.downlink)
    const streamXB = new NetworkStream(XU2, BD)

    streamXB.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(AD.allocation).to.be.equal(0.5)

    expect(streamXB.bandWidth).to.be.equal(0.5)
    expect(XU2.allocation).to.be.equal(0.5)
    expect(BD.allocation).to.be.equal(0.5)

    // Stopping download XA ====================================
    X.gateway.uplink.removeProcess(XU1)
    A.gateway.downlink.removeProcess(AD)

    streamXB.updateBandwidth()

    expect(streamXB.bandWidth).to.be.equal(1)
    expect(XU2.allocation).to.be.equal(1)
    expect(BD.allocation).to.be.equal(1)

    // Starting download XC ====================================
    const XU3 = new StreamerProcess('X', X.gateway.uplink)
    const CD = new StreamerProcess('C', C.gateway.downlink)
    const streamXC = new NetworkStream(XU3, CD)

    streamXB.updateBandwidth()

    expect(streamXB.bandWidth).to.be.equal(0.5)
    expect(XU2.allocation).to.be.equal(0.5)
    expect(BD.allocation).to.be.equal(0.5)

    expect(streamXC.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(AD.allocation).to.be.equal(0.5)
}

async function performance() {
    const numUploaders = 100
    const numDownloaders = 100

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

        const result = FileTransferFactory.create(targetFile, uploaders[upIndex].gateway, downloaders[downIndex].gateway)
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

function bug() {

    const _A = new Player('A')
    const _B = new Player('B')
    const _C = new Player('C')
    const _D = new Player('D')

    // 0: U1 - D1
    var result = FileTransferFactory.create(targetFile, _D.gateway, _B.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()


    // 1: U0 - D0
    var result = FileTransferFactory.create(targetFile, _C.gateway, _A.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()

    // 2: U0 - D1
    var result = FileTransferFactory.create(targetFile, _C.gateway, _B.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()

    // 3: U0 - D1
    var result = FileTransferFactory.create(targetFile, _C.gateway, _B.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()

    // 4: U0 - D0
    var result = FileTransferFactory.create(targetFile, _C.gateway, _A.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()

    // 5: U1 - D1
    var result = FileTransferFactory.create(targetFile, _D.gateway, _B.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()


    // 6: U0 - D0
    var result = FileTransferFactory.create(targetFile, _C.gateway, _A.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()

    // 7: U1 - D0
    var result = FileTransferFactory.create(targetFile, _D.gateway, _A.gateway)
    var { stream } = result.details[0]
    stream.updateBandwidth()


}