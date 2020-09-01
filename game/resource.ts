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

    canAllocate(desiredAllocation: number) {
        return this.freeCapacity() >= desiredAllocation
    }

    allocate(desiredAllocation: number) {
        this.allocated += desiredAllocation
    }

    free(amount: number) {
        this.allocated -= amount
    }

    freeCapacity() {
        return this.capacity - this.allocated
    }

    getOrientedAllocation(consumer: Resource) {
        return ResourceManager.resourceMatrix.getOrientedAllocation(`${this.id}-${consumer.id}`)
    }

    getOrientedAllocationOrFreeCapacity(consumer: Resource) {
        const orientedAllocation = ResourceManager.resourceMatrix.getOrientedAllocation(`${this.id}-${consumer.id}`)
        return orientedAllocation || consumer.freeCapacity()
    }

    // TODO move to ResourceManager
    setOrientedAllocation(consumer: Resource, value: number) {
        ResourceManager.resourceMatrix.setOrientedAllocation(`${this.id}-${consumer.id}`, value)
    }

    updateFairShare() {
        const sortedConsumers = [...this.consumers.sort((c1, c2) => this.getOrientedAllocationOrFreeCapacity(c1) - this.getOrientedAllocationOrFreeCapacity(c2))]

        var allocated = 0
        var allocationCount = 0

        sortedConsumers.forEach(consumer => {
            const fairShare = (this.capacity - allocated) / ((sortedConsumers.length - allocationCount) || 1)

            const newAllocation = Math.min(fairShare, consumer.getOrientedAllocation(this) || consumer.freeCapacity() || consumer.capacity)

            allocated += newAllocation
            allocationCount++

            this.setOrientedAllocation(consumer, newAllocation)
        })
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