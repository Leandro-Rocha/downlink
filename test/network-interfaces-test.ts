import 'mocha'
import { StreamerProcess, NetworkStream } from "../src/network-interfaces"
import { Player } from "./game-interfaces"
import { expect } from 'chai'

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

        // it('can instantiate a data transfer flow', dataTransferFlow)
        // it('can allocate single download with same capacities', singleDownloadSameCapacity)
        // it('can allocate single download bounded by downloader', singleDownloadBoundByDownloader)
        // it('can allocate single download bounded by uploader', singleDownloadBoundByUploader)
        // it('can allocate two downloads', twoDownloads)
        it('can allocate three downloads with reallocation', threeWithReallocation)
        // it('can allocate one download with bounce', oneDownloadWithBounce)
        // it('can allocate two download with bounce limited by other download', twoDownloadWithBounce)
    })



function singleDownloadSameCapacity() {

    const AD = new StreamerProcess('', A.gateway.downlink)
    const XU = new StreamerProcess('', X.gateway.uplink)

    const streamXA = new NetworkStream(XU, AD)

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth)
        .to.be.equal(AD.allocation)
        .to.be.equal(XU.allocation)
        .to.be.equal(1)
}

function singleDownloadBoundByDownloader() {
    A.gateway.downlink.capacity = 0.5

    const AD = new StreamerProcess('', A.gateway.downlink)
    const XU = new StreamerProcess('', X.gateway.uplink)

    const streamXA = new NetworkStream(XU, AD)

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth)
        .to.be.equal(AD.allocation)
        .to.be.equal(XU.allocation)
        .to.be.equal(0.5)
}

function singleDownloadBoundByUploader() {
    X.gateway.uplink.capacity = 0.5

    const AD = new StreamerProcess('', A.gateway.downlink)
    const XU = new StreamerProcess('', X.gateway.uplink)

    const streamXA = new NetworkStream(XU, AD)

    streamXA.updateBandwidth()

    expect(streamXA.bandWidth)
        .to.be.equal(AD.allocation)
        .to.be.equal(XU.allocation)
        .to.be.equal(0.5)
}

function twoDownloads() {

    // Starting download A ==================================
    const AD = new StreamerProcess('A', A.gateway.downlink)
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const streamXA = new NetworkStream(XU1, AD)
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(AD.allocation).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)

    // Starting download B ==================================
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

    // Starting download A ==================================
    const AD1 = new StreamerProcess('A', A.gateway.downlink)
    const XU1 = new StreamerProcess('X', X.gateway.uplink)
    const streamXA = new NetworkStream(XU1, AD1)
    streamXA.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(1)
    expect(XU1.allocation).to.be.equal(1)
    expect(AD1.allocation).to.be.equal(1)


    // Starting first download B ==================================
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
    const XU3 = new StreamerProcess('X', X.gateway.uplink)
    const streamXB2 = new NetworkStream(XU3, BD2)
    streamXB2.updateBandwidth()

    expect(streamXA.bandWidth).to.be.equal(0.75)
    expect(XU1.allocation).to.be.equal(0.75)
    expect(AD1.allocation).to.be.equal(0.75)

    expect(streamXB1.bandWidth).to.be.equal(0.25)
    expect(XU2.allocation).to.be.equal(0.25)
    expect(BD1.allocation).to.be.equal(0.25)

    expect(streamXB2.bandWidth).to.be.equal(0.25)
    expect(XU3.allocation).to.be.equal(0.25)
    expect(BD2.allocation).to.be.equal(0.25)
}




