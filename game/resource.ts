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

    getOrientedAllocation(consumer: Resource) {
        return ResourceManager.resourceMatrix.getOrientedAllocation(`${this.id}-${consumer.id}`)
    }

    getOrientedAllocationOrCapacity(consumer: Resource) {
        const orientedAllocation = ResourceManager.resourceMatrix.getOrientedAllocation(`${this.id}-${consumer.id}`)
        return orientedAllocation || consumer.capacity
    }

    setOrientedAllocation(consumer: Resource, value: number) {
        // console.log(`${this.id}-${consumer.id} ----> ${value}`)

        ResourceManager.resourceMatrix.setOrientedAllocation(`${this.id}-${consumer.id}`, value)
    }

    updateAllocation(padding = '', provoker: Resource | undefined = undefined) {
        // console.log(`${padding}Evaluating ${this.id}`)
        // console.log(`${padding}Oriented - ${ResourceManager.resourceMatrix.allocationMatrix}`)

        const sortedConsumers: Resource[] = Object.values(this.consumers)
        sortedConsumers.sort((c1, c2) => c1.getOrientedAllocationOrCapacity(this) - c2.getOrientedAllocationOrCapacity(this))

        var allocated = 0
        var allocationCount = 0

        sortedConsumers.forEach(consumer => {
            const fairShare = (this.capacity - allocated) / ((sortedConsumers.length - allocationCount) || 1)

            const newAllocation = Math.min(fairShare,
                // (provoker === consumer) ?
                consumer.getOrientedAllocationOrCapacity(this)
                // :
                // consumer.capacity
            )

            const thisToThat = this.getOrientedAllocation(consumer)

            this.setOrientedAllocation(consumer, newAllocation)

            allocated += newAllocation
            allocationCount++

            console.log(`${padding}${this.id} - ${consumer.id} f[${fairShare}] - o[${thisToThat}] - n[${newAllocation}]`)

            const thatToThis = consumer.getOrientedAllocation(this)


            if (thisToThat !== newAllocation
                || thisToThat !== thatToThis
                // && provoker !== consumer
            ) {
                consumer.updateAllocation(padding + '   ', this)

                // console.log(`${padding}Out of ${consumer.id}`)

                // if (thisToThat === thatToThis)

            }
            else {
                // console.log(`${padding}Setting MATRIX`)

                ResourceManager.setAllocationByPair(this, consumer, newAllocation)
            }




        })

        // this.send(this, Interruptions.RESOURCE_ALLOCATION_UPDATED)
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