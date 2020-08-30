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
// iterative()
// resourceManagerTest()
performance()

function performance() {
    const gameloop = new GameLoop()

    const ups = []
    const numUps = 1

    const downs = []
    const numDowns = 100

    const procs = []

    console.log(`Uplinks: ${numUps} - Downlinks: ${numDowns}`)

    console.time(`Create elements`)

    // Uplinks
    for (let index = 0; index < numUps; index++) {
        ups.push(new Resource(ResourceTypes.NETWORK, 'U' + index, numDowns))
    }

    // Downlinks
    for (let index = 0; index < numDowns; index++) {
        downs.push(new Resource(ResourceTypes.NETWORK, 'D' + index, numUps))
    }

    // Processes
    for (let indexU = 0; indexU < numUps; indexU++) {
        for (let indexD = 0; indexD < numDowns; indexD++) {
            procs.push(new Process(`proc${indexU}-${indexD}'`, ups[indexU], downs[indexD], 5000))
        }
    }
    console.timeEnd(`Create elements`)

    gameloop.processes.push(...procs)


    console.time(`Start ${procs.length - 1} processes`)
    for (let index = 0; index < procs.length - 1; index++) {
        procs[index].start()
    }
    console.timeEnd(`Start ${procs.length - 1} processes`)

    console.time(`Start 1 process when there are ${procs.length - 1} active processes`)
    procs[procs.length - 1].start()
    console.timeEnd(`Start 1 process when there are ${procs.length - 1} active processes`)

    gameloop.start()
}

function resourceManagerTest() {
    const A = new Resource(ResourceTypes.NETWORK, 'A', 1)
    const B = new Resource(ResourceTypes.NETWORK, 'B', 0.5)
    const X = new Resource(ResourceTypes.NETWORK, 'X', 1)
    const Y = new Resource(ResourceTypes.NETWORK, 'Y', 1)

    A.addConsumer(X)
    X.addConsumer(A)

    // A.addConsumer(Y)
    // Y.addConsumer(A)

    B.addConsumer(X)
    X.addConsumer(B)

    B.addConsumer(Y)
    Y.addConsumer(B)

    rmInstance.addResources(A, B, X, Y)

    // console.log(rmInstance.getResourceNetwork(A).map(r => r.id))

    // A.removeConsumer(X)
    // X.removeConsumer(A)
    // rmInstance.removeResources(A)

    // console.log(rmInstance.getResourceNetwork(B).map(r => r.id))

    // rmInstance.updateAllocation(A)
    A.updateAllocation()

    console.log(rmInstance.getAllocationByPair(A, X))
    console.log(rmInstance.getAllocationByPair(A, Y))
    console.log(rmInstance.getAllocationByPair(B, X))
    console.log(rmInstance.getAllocationByPair(B, Y))

}

function iterative() {
    var clock = sinon.useFakeTimers()
    const gameloop = new GameLoop()

    const A = new Resource(ResourceTypes.NETWORK, 'A', 1)
    const B = new Resource(ResourceTypes.NETWORK, 'B', 0.5)

    const X = new Resource(ResourceTypes.NETWORK, 'X', 1)
    const Y = new Resource(ResourceTypes.NETWORK, 'Y', 1)

    const proc1 = new Process('AX', X, A, 10 * 1000)
    const proc2 = new Process('BX', X, B, 10 * 1000)
    const proc3 = new Process('BY', Y, B, 10 * 1000)

    proc1.start()
    proc2.start()
    setTimeout(() => proc3.start(), 10000)

    gameloop.processes.push(proc1, proc2, proc3)

    gameloop.start()
    clock.tick(60000)
}



function multipleDownloadsFromDifferentServers() {
    var clock = sinon.useFakeTimers()
    const gameloop = new GameLoop()

    const downlinkA = new Resource(ResourceTypes.NETWORK, 'downlinkA', 1)
    const uplinkU = new Resource(ResourceTypes.NETWORK, 'uplinkU', 1)
    const uplinkZ = new Resource(ResourceTypes.NETWORK, 'uplinkZ', 1)

    const proc1 = new Process('A <- U', uplinkU, downlinkA, 10 * 1000)
    const proc2 = new Process('A <- Z', uplinkZ, downlinkA, 10 * 1000)

    proc1.start()
    setTimeout(() => proc2.start(), 5000)

    gameloop.processes.push(proc1, proc2)

    gameloop.start()

    expect(proc1.isRunning()).to.be.true

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(1)
    // expect(downlinkA.consumers).to.have.property(proc1.PID.toString())
    // expect(downlinkA.consumers[1].process).to.be.equal(proc1)
    // expect(downlinkA.consumers[1].allocation).to.be.equal(1)

    expect(Object.keys(uplinkU.consumers)).to.have.lengthOf(1)
    // expect(uplinkU.consumers).to.have.property(proc1.PID.toString())
    // expect(uplinkU.consumers[1].process).to.be.equal(proc1)

    // after 5 seconds
    clock.tick(5000)

    expect(proc2.isRunning()).to.be.true
    expect(proc1.progress()).to.be.approximately(50,10)

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(2)
    // expect(downlinkA.consumers).to.have.property(proc1.PID.toString())
    // expect(downlinkA.consumers).to.have.property(proc2.PID.toString())
    // expect(downlinkA.consumers[1].process).to.be.equal(proc1)
    // expect(downlinkA.consumers[2].process).to.be.equal(proc2)
    // expect(downlinkA.consumers[1].allocation).to.be.equal(0.5)
    // expect(downlinkA.consumers[2].allocation).to.be.equal(0.5)

    // after 15 seconds
    clock.tick(10010)

    expect(proc1.isRunning()).to.be.false
    expect(proc1.status).to.be.equal(Status.DEAD)

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(1)
    // expect(downlinkA.consumers).to.not.have.property(proc1.PID.toString())
    // expect(downlinkA.consumers).to.have.property(proc2.PID.toString())
    // expect(downlinkA.consumers[2].process).to.be.equal(proc2)
    // expect(downlinkA.consumers[2].allocation).to.be.equal(1)

    // after 20 seconds
    clock.tick(5000)

    expect(proc2.isRunning()).to.be.false
    expect(proc2.status).to.be.equal(Status.DEAD)

    expect(Object.keys(downlinkA.consumers)).to.have.lengthOf(0)
    // expect(downlinkA.consumers).to.not.have.property(proc1.PID.toString())
    // expect(downlinkA.consumers).to.not.have.property(proc2.PID.toString())

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

