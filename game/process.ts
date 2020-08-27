import { Interruptions } from "./interruptions"
import Resource from "./resource"
import { Observer } from "./signal-handler"

export enum Status {
    RUNNING,
    IDLE,
    FINISHED,
    DEAD
}

export class Process extends Observer {
    static lastPID: number = 1
    name: string
    PID: number
    status: Status
    totalWork: number
    workDone: number
    workRate: number
    maxWorkRate: number
    timeout: any = 0

    startTime: number = 0
    lastUpdateTime: number = 0

    uplink: Resource
    downlink: Resource

    constructor(name: string, uplink: Resource, downlink: Resource, totalWork: number) {
        super()

        this.PID = Process.lastPID++

        this.name = name
        this.totalWork = totalWork
        this.workDone = 0
        this.workRate = 0
        this.status = Status.IDLE

        this.uplink = uplink
        this.downlink = downlink

        this.maxWorkRate = Math.min(uplink.capacity, downlink.capacity)

        this.subscribe(this.uplink, 'PROCESS_STARTED', this.uplink.handleProcess)
        this.subscribe(this.uplink, 'PROCESS_FINISHED', this.uplink.handleProcess)

        this.subscribe(this.downlink, 'PROCESS_STARTED', this.downlink.handleProcess)
        this.subscribe(this.downlink, 'PROCESS_FINISHED', this.downlink.handleProcess)
    }

    isRunning() { return this.status === Status.RUNNING }

    timeToComplete() {
        return ((this.totalWork - this.workDone) / this.workRate)
    }


    timeSinceStart() {
        return (Date.now() - this.startTime)
    }

    timeSinceLastUpdate() {
        return (Date.now() - this.lastUpdateTime)
    }

    makeProgress() {
        this.workDone += this.timeSinceLastUpdate() * this.workRate
        this.lastUpdateTime = Date.now()

        if (this.progress() >= 100) this.status = Status.FINISHED
    }

    progress(): number {
        return (this.workDone / this.totalWork) * 100
    }

    start() {
        console.info(`Process (${this.name}) started`)
        this.startTime = Date.now()
        this.lastUpdateTime = this.startTime
        this.status = Status.RUNNING

        this.uplink.addConsumer(this)
        this.downlink.addConsumer(this)

        this.uplink.subscribe(this, Interruptions.RESOURCE_ALLOCATION_UPDATED, this.handleAllocationChanged)
        this.downlink.subscribe(this, Interruptions.RESOURCE_ALLOCATION_UPDATED, this.handleAllocationChanged)

        this.send(this, Interruptions.PROCESS_STARTED)
    }

    handleAllocationChanged(emitter: any) {

        this.makeProgress()

        // console.info(`[${this.name}][u:${this.uplink.getAllocation(this.PID)}/d:${this.downlink.getAllocation(this.PID)}] interrupted by [${emitter.name}] with [${Interruptions.RESOURCE_ALLOCATION_UPDATED}] after ${this.timeSinceStart() / 1000} seconds. Work done: ${this.progress()}%`)

        const downlinkAllocation = this.downlink.getAllocation(this.PID)
        const uplinkAllocation = this.uplink.getAllocation(this.PID)

        const newAllocation = Math.min(downlinkAllocation, uplinkAllocation)

        if (newAllocation != this.workRate) {
            console.info(`New workRate for ${this.name} before:[${this.workRate}] new:[${newAllocation}]`)

            clearTimeout(this.timeout)

            if (this.progress() >= 100) {
                this.exit(3)
            }
            else {
                this.workRate = newAllocation
                this.timeout = setTimeout(() => this.exit(1), this.timeToComplete())
            }
        }
    }

    exit(status: number) {
        this.makeProgress()

        this.status = Status.DEAD

        this.uplink.unsubscribe(this, Interruptions.RESOURCE_ALLOCATION_UPDATED)
        this.downlink.unsubscribe(this, Interruptions.RESOURCE_ALLOCATION_UPDATED)

        this.send(this, 'PROCESS_FINISHED')

        this.uplink.removeConsumer(this)
        this.downlink.removeConsumer(this)


        // if (this.lastUpdateTime - this.startTime > this.totalWork + 10)
        console.info(`Process (${this.name}) exited with status ${status} - work done = ${this.progress()}% - total time=${this.timeSinceStart() / 1000}`)

    }
}