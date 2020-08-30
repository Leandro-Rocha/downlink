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

    updateAllocation() {
        const sortedConsumers: Resource[] = Object.values(this.consumers)
        sortedConsumers.sort((c1, c2) => c1.capacity - c2.capacity)

        this.allocated = 0
        var allocationCount = 0

        sortedConsumers.forEach(consumer => {
            const fairShare = (this.capacity - this.allocated) / ((sortedConsumers.length - allocationCount) || 1)

            const currentAllocation = ResourceManager.getAllocationByPair(this, consumer) || Number.MAX_VALUE
            const newAllocation = Math.min(currentAllocation, fairShare)

            this.allocated += newAllocation
            allocationCount++

            if (currentAllocation != newAllocation) {
                ResourceManager.setAllocationByPair(this, consumer, newAllocation)
                consumer.updateAllocation()
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