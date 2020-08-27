import Process from "./game/process"
import Resource, { ResourceTypes } from "./game/resource"
require('console-stamp')(console, { pattern: 'HH:MM:ss.l' });


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


multipleDownloadsFromDifferentServers()

function multipleDownloadsFromDifferentServers() {
    const downlinkA = new Resource(ResourceTypes.NETWORK, 'downlinkA', 1)
    const uplinkU = new Resource(ResourceTypes.NETWORK, 'uplinkU', 1)
    const uplinkZ = new Resource(ResourceTypes.NETWORK, 'uplinkZ', 1)


    const proc1 = new Process('A DL1 from U', uplinkU, downlinkA, 10 * 1000)
    const proc2 = new Process('A DL2 from Z', uplinkZ, downlinkA, 10 * 1000)
    proc1.start()
    setTimeout(() => proc2.start(), 5000)
}



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



