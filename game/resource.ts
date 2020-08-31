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

    updateOriented(visitedResources: Resource[] = [], padding = '') {
        const sortedConsumers = [...this.consumers]
            .sort((c1, c2) => c1.getOrientedAllocationOrCapacity(this) - c2.getOrientedAllocationOrCapacity(this))

        var allocated = 0
        var allocationCount = 0

        sortedConsumers.forEach(consumer => {
            const fairShare = (this.capacity - allocated) / ((sortedConsumers.length - allocationCount) || 1)

            const newAllocation = Math.min(
                fairShare,
                (visitedResources.includes(consumer)) ? consumer.getOrientedAllocationOrCapacity(this) : consumer.capacity
            )

            allocated += newAllocation
            allocationCount++

            this.setOrientedAllocation(consumer, newAllocation)

            const thisToThat = this.getOrientedAllocation(consumer)
            const thatToThis = consumer.getOrientedAllocation(this)

            console.log(`${padding}[${this.id}-${consumer.id}]: ${thisToThat}`)
            console.log(`${padding}[${consumer.id}-${this.id}]: ${thatToThis}`)

            if (thatToThis !== thisToThat) {
                console.log(`${padding}Consumer [${consumer.id}] should update`)
                consumer.updateOriented([...visitedResources, this], padding + '    ')
            }
            else {
                console.log(`${padding}${this.id} and [${consumer.id}] agrees!`)
                ResourceManager.setAllocationByPair(this, consumer, newAllocation)
            }
        })
    }

    updateAllocation(padding = '', provoker: Resource | undefined = undefined) {
        console.log(`${padding}Evaluating ${this.id}`)

        const visitedResources = [this]
        this.consumers.forEach(c => {
            if (this.getOrientedAllocation(c) === undefined) {
                c.updateOriented(this, visitedResources)
            }
        })



        console.log(`${padding}Oriented - ${ResourceManager.resourceMatrix.allocationMatrix}`)

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



            this.setOrientedAllocation(consumer, newAllocation)

            allocated += newAllocation
            allocationCount++

            const thisToThat = this.getOrientedAllocation(consumer)
            const thatToThis = consumer.getOrientedAllocation(this)

            console.log(`${padding}${this.id} - ${consumer.id} f[${fairShare}] - o[${thisToThat}] - n[${newAllocation}]`)


            if (thisToThat !== newAllocation
                || thisToThat !== thatToThis
                // && provoker !== consumer
            ) {
                // consumer.updateAllocation(padding + '   ', this)

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
        // console.log(`${this.id} is adding ${consumer.id}`)
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