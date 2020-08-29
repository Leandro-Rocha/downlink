import { Interruptions } from "./interruptions"
import { Process } from "./process"
import { Observer } from "./signal-handler"
import { EventEmitter } from "events"
import { ResourceManager } from "./resource-manager"

export default class Resource extends Observer {
    type: ResourceTypes
    name: string
    id: string
    capacity: number
    allocated: number

    consumers: Resource[] = []

    constructor(type: ResourceTypes, name: string, capacity: number) {
        super()

        this.type = type
        this.name = name
        this.id = name
        this.capacity = capacity
        this.allocated = 0
    }

    handleProcess() {
        this.updateAllocation()
    }

    updateAllocation(provoker: Resource) {
        const sortedConsumers: Resource[] = Object.values(this.consumers)


        sortedConsumers.sort((c1, c2) => {
            const c1Cap = c1 === provoker ? ResourceManager.getAllocationByPair(this, c1) : c1.capacity
            const c2Cap = c2 === provoker ? ResourceManager.getAllocationByPair(this, c2) : c2.capacity
            return c1Cap - c2Cap
        })

        this.allocated = 0
        var allocationCount = 0

        sortedConsumers.forEach(consumer => {
            const fairShare = (this.capacity - this.allocated) / ((sortedConsumers.length - allocationCount) || 1)

            const newAllocation = Math.min(consumer === provoker ? ResourceManager.getAllocationByPair(this, consumer) : consumer.capacity, fairShare)

            this.allocated += newAllocation
            allocationCount++

            const currentAllocation = ResourceManager.getAllocationByPair(this, consumer)

            if (currentAllocation != newAllocation) {
                ResourceManager.setAllocationByPair(this, consumer, newAllocation)

                if (provoker === undefined || consumer !== provoker) {
                    // console.log(`Propagating change from ${this.id} to ${consumer.id}`);
                    consumer.updateAllocation(this)
                }
            }
        })

        this.send(this, Interruptions.RESOURCE_ALLOCATION_UPDATED)
    }


    addConsumer(consumer: Resource) {
        this.consumers.push(consumer)
    }

    removeConsumer(consumer: Resource) {
        this.consumers = this.consumers.filter(c => c !== consumer)
    }
}


export enum ResourceTypes {
    NETWORK,
    MEMORY,
    CPU
}