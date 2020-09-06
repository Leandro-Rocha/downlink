// import { SIGNALS } from "./interruptions"
// import Resource from "./resource"
// import { Observer } from "./signal"
// import { ResourceManager } from "./resource-manager"

// export enum Status {
//     RUNNING,
//     IDLE,
//     FINISHED,
//     DEAD
// }

// export class Process extends Observer {
//     static lastPID: number = 1
//     name: string
//     PID: number
//     status: Status
//     totalWork: number
//     workDone: number
//     workRate: number
//     maxWorkRate: number
//     timeout: any = 0

//     startTime: number = 0
//     lastUpdateTime: number = 0

//     uplink: Resource
//     downlink: Resource

//     constructor(name: string, uplink: Resource, downlink: Resource, totalWork: number) {
//         super()

//         this.PID = Process.lastPID++

//         this.name = name
//         this.totalWork = totalWork
//         this.workDone = 0
//         this.workRate = 0
//         this.status = Status.IDLE

//         this.uplink = uplink
//         this.downlink = downlink

//         this.maxWorkRate = Math.min(uplink.capacity, downlink.capacity)

//         this.subscribe(ResourceManager, SIGNALS.PROCESS_STARTED, () => ResourceManager.updateAllocation(this.downlink))
//         this.subscribe(ResourceManager, SIGNALS.PROCESS_FINISHED, () => ResourceManager.updateAllocation(this.downlink))
//     }

//     isRunning() { return this.status === Status.RUNNING }

//     timeToComplete() {
//         return ((this.totalWork - this.workDone) / this.workRate)
//     }


//     timeSinceStart() {
//         return (Date.now() - this.startTime)
//     }

//     timeSinceLastUpdate() {
//         return (Date.now() - this.lastUpdateTime)
//     }

//     makeProgress(elapsed: number) {
//         this.workDone += elapsed * this.workRate

//         if (this.progress() >= 100) this.exit(0)
//     }

//     progress(): number {
//         return (this.workDone / this.totalWork) * 100
//     }

//     start() {
//         // console.info(`Process (${this.name}) started`)
//         this.startTime = Date.now()
//         this.lastUpdateTime = this.startTime
//         this.status = Status.RUNNING

//         this.uplink.addConsumer(this.downlink)
//         this.downlink.addConsumer(this.uplink)

//         this.uplink.subscribe(this, SIGNALS.RESOURCE_ALLOCATION_UPDATED, this.handleAllocationChanged)
//         this.downlink.subscribe(this, SIGNALS.RESOURCE_ALLOCATION_UPDATED, this.handleAllocationChanged)

//         this.send(this, SIGNALS.PROCESS_STARTED)
//     }

//     handleAllocationChanged(emitter: any) {
//         // console.info(`[${this.name}][u:${this.uplink.getAllocation(this.PID)}/d:${this.downlink.getAllocation(this.PID)}] interrupted by [${emitter.name}] with [${Interruptions.RESOURCE_ALLOCATION_UPDATED}] after ${this.timeSinceStart() / 1000} seconds. Work done: ${this.progress()}%`)

//         const newAllocation = ResourceManager.getAllocationByPair(this.downlink, this.uplink)

//         if (newAllocation != this.workRate) {
//             console.info(`New workRate for ${this.name} before:[${this.workRate}] new:[${newAllocation}]`)
//             this.workRate = newAllocation
//         }
//     }

//     exit(status: number) {
//         this.status = Status.DEAD

//         // if (this.lastUpdateTime - this.startTime > this.totalWork + 10)
//         console.info(`Process (${this.name}) exited with status ${status} - work done = ${this.progress()}% - total time=${this.timeSinceStart() / 1000}`)

//         this.uplink.removeConsumer(this.downlink)
//         this.downlink.removeConsumer(this.uplink)

//         this.send(this, SIGNALS.PROCESS_FINISHED)

//         ResourceManager.observer.unsubscribe(this, SIGNALS.PROCESS_STARTED)
//         ResourceManager.observer.unsubscribe(this, SIGNALS.PROCESS_FINISHED)
//     }
// }