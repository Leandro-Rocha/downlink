import 'mocha'
import { expect } from 'chai'
import { SIGNALS } from '../src/signal'
import { Player } from '../src/core/player'
import { StreamerProcess } from '../src/core/process'
import { NetworkStream, BounceInfo } from '../src/network-interfaces'

var A: Player = new Player('A')
var B: Player = new Player('B')
var C: Player = new Player('C')
var X: Player = new Player('X')
var Y: Player = new Player('Y')
var Z: Player = new Player('Z')
// const targetFile = new File('TargetFile', 1000)

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
    })



function singleDownloadSameCapacity() {

    const AD = new StreamerProcess('', A.gateway.downlink)
    const XU = new StreamerProcess('', X.gateway.uplink)

    const streamXA = new NetworkStream(XU, AD)

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(AD.allocation).to.be.equal(1)
    expect(XU.allocation).to.be.equal(1)
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
    const AD = new StreamerProcess('A', A.gateway.downlink)
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const streamXA = new NetworkStream(XU1, AD)
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(AD.allocation).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)

    // Starting download B =====================================
    const BD = new StreamerProcess('B', B.gateway.downlink)
    const XU2 = new StreamerProcess('X', X.gateway.uplink)
    const streamXB = new NetworkStream(XU2, BD)
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
    const AD1 = new StreamerProcess('A', A.gateway.downlink)
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const streamXA = new NetworkStream(XU1, AD1)
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)
    expect(AD1.allocation).to.be.equal(1)


    // Starting first download B ===============================
    const BD1 = new StreamerProcess('B', B.gateway.downlink)
    const XU2 = new StreamerProcess('X', X.gateway.uplink)
    const streamXB1 = new NetworkStream(XU2, BD1)
    streamXB1.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(streamXB1.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(AD1.allocation).to.be.equal(0.5)

    expect(XU2.allocation).to.be.equal(0.5)
    expect(BD1.allocation).to.be.equal(0.5)

    // Starting second download B ==============================
    const BD2 = new StreamerProcess('B', B.gateway.downlink)
    const XU3 = new StreamerProcess('X', X.gateway.uplink)
    const streamXB2 = new NetworkStream(XU3, BD2)
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
    const AD1 = new StreamerProcess('A', A.gateway.downlink)
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const streamXA = new NetworkStream(XU1, AD1)
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)
    expect(AD1.allocation).to.be.equal(1)


    // Starting first download B ===============================
    const BD1 = new StreamerProcess('B', B.gateway.downlink)
    const XU2 = new StreamerProcess('X', X.gateway.uplink)
    const streamXB1 = new NetworkStream(XU2, BD1)
    streamXB1.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.5)
    expect(streamXB1.bandWidth).to.be.equal(0.5)
    expect(XU1.allocation).to.be.equal(0.5)
    expect(AD1.allocation).to.be.equal(0.5)

    expect(XU2.allocation).to.be.equal(0.5)
    expect(BD1.allocation).to.be.equal(0.5)

    // Starting second download B =============================
    const BD2 = new StreamerProcess('B', B.gateway.downlink)
    const CU1 = new StreamerProcess('C', C.gateway.uplink)
    const streamXB2 = new NetworkStream(CU1, BD2)
    streamXB2.updateBandwidth()

    expect(streamXA.bandWidth).to.be.approximately(0.75, 0.001)
    expect(XU1.allocation).to.be.approximately(0.75, 0.001)
    expect(AD1.allocation).to.be.approximately(0.75, 0.001)

    expect(streamXB1.bandWidth).to.be.equal(0.25)
    expect(XU2.allocation).to.be.equal(0.25)
    expect(BD1.allocation).to.be.equal(0.25)

    expect(streamXB2.bandWidth).to.be.equal(0.25)
    expect(CU1.allocation).to.be.equal(0.25)
    expect(BD2.allocation).to.be.equal(0.25)
}

function oneDownloadWithBounce() {

    // Starting download X->C ==================================
    const CD1 = new StreamerProcess('C', C.gateway.downlink)
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const streamXC = new NetworkStream(XU1, CD1)

    // Starting download C->B ==================================
    const BD1 = new StreamerProcess('B', B.gateway.downlink)
    const CU1 = new StreamerProcess('C', C.gateway.uplink)
    const streamCB = new NetworkStream(CU1, BD1)

    // Starting download B->A ==================================
    const AD1 = new StreamerProcess('A', A.gateway.downlink)
    const BU1 = new StreamerProcess('B', B.gateway.uplink)
    const streamBA = new NetworkStream(BU1, AD1)

    const bounceInfo = new BounceInfo()
    streamXC.bounceInfo = bounceInfo
    streamCB.bounceInfo = bounceInfo
    streamBA.bounceInfo = bounceInfo

    bounceInfo.registerHandler(streamXC, SIGNALS.BOUNCE_ALLOCATION_CHANGED, streamXC.handleBounceAllocationChanged)
    bounceInfo.registerHandler(streamCB, SIGNALS.BOUNCE_ALLOCATION_CHANGED, streamCB.handleBounceAllocationChanged)
    bounceInfo.registerHandler(streamBA, SIGNALS.BOUNCE_ALLOCATION_CHANGED, streamBA.handleBounceAllocationChanged)

    streamXC.downstream = streamCB

    streamCB.upstream = streamXC
    streamCB.downstream = streamBA

    streamBA.upstream = streamCB



    // streamXC.updateBandwidth()
    streamCB.updateBandwidth()
    // streamBA.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(1)
    expect(streamCB.bandWidth).to.be.equal(1)
    expect(streamBA.bandWidth).to.be.equal(1)
}


function twoDownloadWithBounce() {

    // Starting download X->C ==================================
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const CD1 = new StreamerProcess('C', C.gateway.downlink)
    const streamXC = new NetworkStream(XU1, CD1)

    // Starting download C->B ==================================
    const CU1 = new StreamerProcess('C', C.gateway.uplink)
    const BD1 = new StreamerProcess('B', B.gateway.downlink)
    const streamCB = new NetworkStream(CU1, BD1)

    // Starting download B->A ==================================
    const BU1 = new StreamerProcess('B', B.gateway.uplink)
    const AD1 = new StreamerProcess('A', A.gateway.downlink)
    const streamBA = new NetworkStream(BU1, AD1)

    // First bounce ============================================
    const bounceInfo = new BounceInfo()
    streamXC.bounceInfo = bounceInfo
    streamCB.bounceInfo = bounceInfo
    streamBA.bounceInfo = bounceInfo

    bounceInfo.registerHandler(streamXC, SIGNALS.BOUNCE_ALLOCATION_CHANGED, streamXC.handleBounceAllocationChanged)
    bounceInfo.registerHandler(streamCB, SIGNALS.BOUNCE_ALLOCATION_CHANGED, streamCB.handleBounceAllocationChanged)
    bounceInfo.registerHandler(streamBA, SIGNALS.BOUNCE_ALLOCATION_CHANGED, streamBA.handleBounceAllocationChanged)

    streamXC.downstream = streamCB

    streamCB.upstream = streamXC
    streamCB.downstream = streamBA

    streamBA.upstream = streamCB
    // =========================================================


    // streamXC.updateBandwidth()
    streamCB.updateBandwidth()
    // streamBA.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(1)
    expect(streamCB.bandWidth).to.be.equal(1)
    expect(streamBA.bandWidth).to.be.equal(1)


    // Starting download Y->C ==================================
    const YU1 = new StreamerProcess('Y', Y.gateway.uplink)
    const CD2 = new StreamerProcess('C', C.gateway.downlink)
    const streamYC1 = new NetworkStream(YU1, CD2)
    streamYC1.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(0.5)
    expect(streamCB.bandWidth).to.be.equal(0.5)
    expect(streamBA.bandWidth).to.be.equal(0.5)
    expect(streamYC1.bandWidth).to.be.equal(0.5)

    // Starting download C->Y ==================================
    const CU2 = new StreamerProcess('C', C.gateway.uplink)
    const YD1 = new StreamerProcess('Y', Y.gateway.downlink)
    const streamCY1 = new NetworkStream(CU2, YD1)
    streamCY1.updateBandwidth()

    expect(streamXC.bandWidth).to.be.equal(0.5)
    expect(streamCB.bandWidth).to.be.equal(0.5)
    expect(streamBA.bandWidth).to.be.equal(0.5)
    expect(streamYC1.bandWidth).to.be.equal(0.5)
    expect(streamCY1.bandWidth).to.be.equal(0.5)

    // Starting download C->Y ==================================
    const CU3 = new StreamerProcess('C', C.gateway.uplink)
    const YD2 = new StreamerProcess('Y', Y.gateway.downlink)
    const streamCY2 = new NetworkStream(CU3, YD2)

    streamCY2.updateBandwidth()

    expect(streamXC.bandWidth).to.be.approximately(0.333, 0.001)
    expect(streamCB.bandWidth).to.be.approximately(0.333, 0.001)
    expect(streamBA.bandWidth).to.be.approximately(0.333, 0.001)
    expect(streamYC1.bandWidth).to.be.approximately(0.666, 0.001)
    expect(streamCY1.bandWidth).to.be.approximately(0.333, 0.001)
    expect(streamCY2.bandWidth).to.be.approximately(0.333, 0.001)
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