import Resource, { ResourceTypes } from "../game/resource"
import sinon from "sinon";
require('console-stamp')(console, { pattern: 'HH:MM:ss.l' });
import { expect } from 'chai';
import { Process, Status } from "../game/process";
import { GameLoop } from "../game/game-loop";
import { ResourceManager } from "../game/resource-manager";

const rmInstance = ResourceManager

// multipleDownloadsFromDifferentServers()
// balance()
iterative()
// resourceManagerTest()

function resourceManagerTest() {
    const A = new Resource(ResourceTypes.NETWORK, 'A', 1)
    const B = new Resource(ResourceTypes.NETWORK, 'B', 0.5)
    const X = new Resource(ResourceTypes.NETWORK, 'X', 1)
    const Y = new Resource(ResourceTypes.NETWORK, 'Y', 1)

    A.addConsumer(X)
    X.addConsumer(A)

    A.addConsumer(Y)
    Y.addConsumer(A)

    B.addConsumer(X)
    X.addConsumer(B)

    rmInstance.addResources(A, B, X, Y)

    A.removeConsumer(X)
    A.removeConsumer(Y)

    rmInstance.removeResources(A)
}

function iterative() {
    var clock = sinon.useFakeTimers()
    const gameloop = new GameLoop()

    const downlinkA = new Resource(ResourceTypes.NETWORK, 'A', 1)
    const downlinkB = new Resource(ResourceTypes.NETWORK, 'B', 0.5)

    const uplinkX = new Resource(ResourceTypes.NETWORK, 'X', 1)
    const uplinkY = new Resource(ResourceTypes.NETWORK, 'Y', 1)

    const proc1 = new Process('AX', uplinkX, downlinkA, 10 * 1000)
    const proc2 = new Process('BX', uplinkX, downlinkB, 10 * 1000)
    const proc3 = new Process('BY', uplinkY, downlinkB, 10 * 1000)

    proc1.start()
    proc2.start()
    setTimeout(() => proc3.start(), 10000)

    gameloop.processes.push(proc1, proc2, proc3)

    gameloop.start()
    clock.tick(60000)
}



function multipleDownloadsFromDifferentServers() {
    var clock = sinon.useFakeTimers()

    const downlinkA = new Resource(ResourceTypes.NETWORK, 'downlinkA', 1)
    const uplinkU = new Resource(ResourceTypes.NETWORK, 'uplinkU', 1)
    const uplinkZ = new Resource(ResourceTypes.NETWORK, 'uplinkZ', 1)

    const proc1 = new Process('A <- U', uplinkU, downlinkA, 10 * 1000)
    const proc2 = new Process('A <- Z', uplinkZ, downlinkA, 10 * 1000)

    proc1.start()
    setTimeout(() => proc2.start(), 5000)

    expect(proc1.isRunning()).to.be.true

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(1)
    expect(downlinkA.consumers).to.have.property(proc1.PID.toString())
    expect(downlinkA.consumers[1].process).to.be.equal(proc1)
    expect(downlinkA.consumers[1].allocation).to.be.equal(1)

    expect(Object.keys(uplinkU.consumers)).to.have.lengthOf(1)
    expect(uplinkU.consumers).to.have.property(proc1.PID.toString())
    expect(uplinkU.consumers[1].process).to.be.equal(proc1)

    // after 5 seconds
    clock.tick(5000)

    expect(proc2.isRunning()).to.be.true
    expect(proc1.progress()).to.be.equal(50)

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(2)
    expect(downlinkA.consumers).to.have.property(proc1.PID.toString())
    expect(downlinkA.consumers).to.have.property(proc2.PID.toString())
    expect(downlinkA.consumers[1].process).to.be.equal(proc1)
    expect(downlinkA.consumers[2].process).to.be.equal(proc2)
    expect(downlinkA.consumers[1].allocation).to.be.equal(0.5)
    expect(downlinkA.consumers[2].allocation).to.be.equal(0.5)

    // after 15 seconds
    clock.tick(10000)

    expect(proc1.isRunning()).to.be.false
    expect(proc1.status).to.be.equal(Status.DEAD)

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(1)
    expect(downlinkA.consumers).to.not.have.property(proc1.PID.toString())
    expect(downlinkA.consumers).to.have.property(proc2.PID.toString())
    expect(downlinkA.consumers[2].process).to.be.equal(proc2)
    expect(downlinkA.consumers[2].allocation).to.be.equal(1)

    // after 20 seconds
    clock.tick(5000)

    expect(proc2.isRunning()).to.be.false
    expect(proc2.status).to.be.equal(Status.DEAD)

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(0)
    expect(downlinkA.consumers).to.not.have.property(proc1.PID.toString())
    expect(downlinkA.consumers).to.not.have.property(proc2.PID.toString())

}



function balance() {
    var clock = sinon.useFakeTimers()

    const downlinkA = new Resource(ResourceTypes.NETWORK, 'downlinkA', 1)
    const downlinkB = new Resource(ResourceTypes.NETWORK, 'downlinkB', 0.5)

    const uplinkX = new Resource(ResourceTypes.NETWORK, 'uplinkY', 1)
    const uplinkY = new Resource(ResourceTypes.NETWORK, 'uplinkY', 1)

    const proc1 = new Process('A <- X', uplinkX, downlinkA, 10 * 1000)
    const proc2 = new Process('B <- X', uplinkX, downlinkB, 10 * 1000)

    const proc3 = new Process('B <- Y', uplinkY, downlinkB, 10 * 1000)

    proc1.start()
    proc2.start()
    setTimeout(() => proc3.start(), 10000)

    clock.tick(60000)
}

// const uplinkZ = new Resource(ResourceTypes.NETWORK, 'uplinkZ', 2)
// const downlinkZ = new Resource(ResourceTypes.NETWORK, 'downlinkZ', 1)

// const uplinkA = new Resource(ResourceTypes.NETWORK, 'uplinkA', 1)
// const downlinkA = new Resource(ResourceTypes.NETWORK, 'downlinkA', 10)


// const uplinkU = new Resource(ResourceTypes.NETWORK, 'uplinkU', 5)
// const downlinkU = new Resource(ResourceTypes.NETWORK, 'downlinkU', 2)

// const proc1 = new Process('A from Z', uplinkZ, downlinkA, 20 * 1000)
// const proc2 = new Process('U from Z', uplinkZ, downlinkU, 20 * 1000)
// proc1.start()
// setTimeout(() => proc2.start(), 5000)







// const uplink1 = new Resource(ResourceTypes.NETWORK, 'Remote server uplink 1', 15)
// const uplink2 = new Resource(ResourceTypes.NETWORK, 'Remote server uplink 2', 1)
// const downlink1 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 1', 1)
// const downlink2 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 2', 2)
// const downlink3 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 3', 3)
// const downlink4 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 4', 4)
// const downlink5 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 5', 5)

// const proc1 = new Process('download1', uplink1, downlink1, 1000)
// const proc2 = new Process('download2', uplink1, downlink2, 2000)
// const proc3 = new Process('download3', uplink1, downlink3, 3000)
// const proc4 = new Process('download4', uplink1, downlink4, 4000)
// const proc5 = new Process('download5', uplink1, downlink5, 5000)

// proc1.start()
// proc2.start()
// proc3.start()
// proc4.start()
// proc5.start()
// setTimeout(() => proc2.start(), 0)
// setTimeout(() => proc3.start(), 0)



// var targetDownloads = 1000
// console.time(`Create ${targetDownloads} elements`)

// for (let i = 0; i < targetDownloads; i++) {
//     const downlink1 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 1', 1)
//     new Process('download ' + i, uplink1, downlink1, 5000).start()
// }

// console.timeEnd(`Create ${targetDownloads} elements`)



// console.log(Object.keys(uplink1.consumers).length)

// const uplink1 = new Resource(ResourceTypes.NETWORK, 'Remote server uplink 1', 100000000000)
// var i = 0;
// setInterval(() => {
//     // const uplink1 = new Resource(ResourceTypes.NETWORK, 'Remote server uplink 1', 1)
//     const downlink1 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 1', 1)
//     new Process('download ' + i++, uplink1, downlink1, 5000).start()
// }, 1000 / 10)

// setInterval(() => {
//     console.log(Object.keys(uplink1.consumers).length)
// }, 1000)

// while (i < 100000) {
//     const uplink1 = new Resource(ResourceTypes.NETWORK, 'Remote server uplink 1', 1)
//     const downlink1 = new Resource(ResourceTypes.NETWORK, 'Local server downlink 1', 1)
//     new Process('download ' + i++, uplink1, downlink1, 5000).start()
// }
