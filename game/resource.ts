import { Interruptions } from "./interruptions"
import Process from "./process"
import { Observer } from "./signal-handler"
import { EventEmitter } from "events"

export default class Resource extends Observer {
    type: ResourceTypes
    name: string
    capacity: number
    allocated: number

    consumers: { [keys: number]: { process: Process, allocation: number } } = {}
    observers: any[] = []

    constructor(type: ResourceTypes, name: string, capacity: number) {
        super()

        this.type = type
        this.name = name
        this.capacity = capacity
        this.allocated = 0
    }

    handleProcess() {
        this.updateAllocation()
    }

    getAllocation(PID: number) {
        if (this.consumers[PID] === undefined) return 0
        return this.consumers[PID].allocation
    }

    updateAllocation() {
        var runningConsumers: { process: Process, allocation: number }[] = []

        for (const consumer of Object.values(this.consumers)) {

            if (consumer.process.isRunning()) {
                runningConsumers.push(consumer)
            }
            else {
                consumer.allocation = 0
            }
        }

        runningConsumers.sort((c1, c2) => c1.process.maxWorkRate - c2.process.maxWorkRate)

        this.allocated = 0

        while (runningConsumers.length > 0) {
            const fairShare = (this.capacity - this.allocated) / runningConsumers.length
            const c = runningConsumers.shift()
            if (c === undefined) continue

            const newAllocation = Math.min(c.process.maxWorkRate, fairShare)
            this.allocated += newAllocation
            c.allocation = newAllocation
        }

        this.send(this, 'RESOURCE_ALLOCATION_UPDATED')
    }


    addConsumer(consumer: Process) {
        this.consumers[consumer.PID] = { process: consumer, allocation: 0 }

        consumer.subscribe(this, 'PROCESS_STARTED', this.handleProcess)
        consumer.subscribe(this, 'PROCESS_FINISHED', this.handleProcess)
    }

    removeConsumer(consumer: Process) {
        delete this.consumers[consumer.PID]

        consumer.unsubscribe(this, 'PROCESS_STARTED')
        consumer.unsubscribe(this, 'PROCESS_FINISHED')
    }
}


export enum ResourceTypes {
    NETWORK,
    MEMORY,
    CPU
}