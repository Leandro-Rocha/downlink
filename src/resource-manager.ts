import Resource from "./resource";
import { Observer } from "./signal-handler";
import { NetworkProcess } from "../test/game-interfaces";

export class ResourceMatrix {
    allocationMatrix: { [key: string]: number } = {}
    orientedMatrix: { [key: string]: number } = {}

    getAllocation(index: string) {
        return this.allocationMatrix[index]
    }

    getOrientedAllocation(index: string) {
        return this.orientedMatrix[index]
    }

    setOrientedAllocation(index: string, value: number) {
        if (index === undefined || value === undefined) return
        this.orientedMatrix[index] = value
    }
    setAllocation(index: string, value: number) {
        if (index === undefined || value === undefined) return
        this.allocationMatrix[index] = value
    }

    getAllocationsForResource(id: string) {
        if (id === undefined || id.length === 0) return
        return Object.keys(this.allocationMatrix).filter(index => index.includes(id))
    }

    removeOrientedAllocationsForResource(resource: Resource) {
        if (resource === undefined) return

        Object.keys(this.orientedMatrix)
            .filter(index => index.includes(resource.id))
            .forEach(index => this.removeOrientedEntry(index))
    }

    removeEntry(index: string) {
        delete this.allocationMatrix[index]
    }

    removeOrientedEntry(index: string) {
        delete this.orientedMatrix[index]
    }
}

export class ResourceManager {
    static resourceList: Resource[] = []
    static reallocationList: NetworkProcess[] = []
    static resourceMatrix: ResourceMatrix = new ResourceMatrix()
    static observer: Observer = new Observer()

    // static addResources(...resources: Resource[]) {
    //     if (resources === undefined) return

    //     ResourceManager.resourceList.push(...resources)

    //     resources.forEach(r1 => r1.consumers.forEach(r2 => {
    //         this.setAllocationByPair(r1, r2, 0)
    //     }))
    // }

    static processReallocationList() {

        while (ResourceManager.reallocationList.length > 0) {
            const resource = ResourceManager.reallocationList.shift()
            if (resource === undefined) return

            const consumer = resource.pair

            // Removes all allocations from that consumer / zero allocation
            const currentAllocation = ResourceManager.getAllocationByPair(resource, consumer) || 0

            resource.allocated -= currentAllocation
            consumer.allocated -= currentAllocation

            // Update its fairShare considering consumers free allocations
            resource.updateFairShare()

            const desiredAllocation = ResourceManager.resourceMatrix.getOrientedAllocation(`${resource.pid}-${consumer.pid}`)

            if (consumer.canAllocate(desiredAllocation)) {
                // console.log(`${resource.pid}-${consumer.pid}:${desiredAllocation}`)

                resource.allocated += desiredAllocation
                consumer.allocated += desiredAllocation

                const minLink = resource.bounceInfo.chain
                    .filter(p => p.allocated > 0)
                    .sort((p1, p2) => p1.allocated - p2.allocated).shift()
                if (minLink !== undefined) {
                    if (minLink.allocated !== resource.bounceInfo.sharedAllocation) {
                        resource.bounceInfo.sharedAllocation = minLink.allocated || Number.MAX_VALUE
                        ResourceManager.reallocationList.push(...resource.bounceInfo.chain)
                    }

                }

                this.setAllocationByPair(resource, consumer, desiredAllocation)
                ResourceManager.resourceMatrix.removeOrientedEntry(`${resource.pid}-${consumer.pid}`)
                ResourceManager.resourceMatrix.removeOrientedEntry(`${consumer.pid}-${resource.pid}`)

                ResourceManager.reallocationList = ResourceManager.reallocationList.filter(p => p !== resource && p !== consumer)

                // TODO this is because unused resources
                if (resource.allocated < resource.getCapacity()) {
                    ResourceManager.reallocationList.push(consumer)
                }

                if (consumer.allocated > consumer.getCapacity()) {
                    continue
                }

                if (consumer.allocated === consumer.bounceInfo.sharedAllocation) {
                    continue
                }

                // If consumer still have capacity to allocate, give it a chance to redistribute
                if (consumer.getFreeCapacity() !== 0) {
                    console.log(`Adding ${consumer.pid} to the list as it has [${consumer.getFreeCapacity()}] left`)

                    ResourceManager.reallocationList.push(consumer)
                }
            }
            else {
                // Consumer does not have enough capacity, redistribute what it have 
                console.log(`Adding ${consumer.pid} to the list as it cannot allocate ${desiredAllocation}. [${consumer.getFreeCapacity()}] left`)
                ResourceManager.reallocationList.push(consumer)
            }
            // })
        }
    }

    // static linkResources(processA: NetworkProcess, processB: NetworkProcess) {
    //     // processA.networkLink.addConsumer(processB.networkLink)
    //     // processB.networkLink.addConsumer(processA.networkLink)

    //     ResourceManager.reallocationList.push(processA)
    // }


    // static unlinkResources(resourceA: Resource, resourceB: Resource) {
    //     resourceA.removeConsumer(resourceB)
    //     resourceB.removeConsumer(resourceA)
    //     this.resourceMatrix.removeEntry(this.getMatrixIndex(resourceA, resourceB))

    //     ResourceManager.reallocationList.push(resourceA)
    //     ResourceManager.reallocationList.push(resourceB)
    // }

    static removeResources(...resources: Resource[]) {
        ResourceManager.resourceList = ResourceManager.resourceList.filter(r => !resources.includes(r))

        resources.forEach(r => {
            if (r.consumers.length > 0) {
                console.error(`Cannot remove resource [${r.id}] from matrix as it still have consumers:[${r.consumers.map(c => c.id)}]`)
            }
            else {
                this.resourceMatrix.getAllocationsForResource(r.id) || []
                    .forEach(index => this.resourceMatrix.removeEntry(index))
            }
        })
    }

    static getMatrixIndex(resourceA: NetworkProcess, resourceB: NetworkProcess) {
        return [resourceA.pid, resourceB.pid].sort().join('-')
    }

    static getAllocationByPair(resourceA: NetworkProcess, resourceB: NetworkProcess) {
        return ResourceManager.resourceMatrix.getAllocation(ResourceManager.getMatrixIndex(resourceA, resourceB))
    }

    static setAllocationByPair(resourceA: NetworkProcess, resourceB: NetworkProcess, value: number) {
        this.setAllocation(ResourceManager.getMatrixIndex(resourceA, resourceB), value)
    }

    static getAllocation(index: string) {
        return ResourceManager.resourceMatrix.getAllocation(index)
    }

    static setAllocation(index: string, value: number) {
        ResourceManager.resourceMatrix.setAllocation(index, value)
    }

    static updateAllocation(resource: Resource) {
        ResourceManager.resourceMatrix = new ResourceMatrix()
        // this.getResourceNetwork(resource).forEach(r => r.updateAllocation())
    }



    static getResourceNetwork(resource: Resource) {
        const result: { path: Resource[], visitedResources: Resource[] } = { path: [], visitedResources: [] }

        result.path.push(resource)

        this.internalDPS(resource, result)

        return result.path
    }

    private static internalDPS(resource: Resource, result: { path: Resource[], visitedResources: Resource[] }) {

        result.visitedResources.push(resource)

        resource.consumers.forEach(consumer => {
            if (!result.visitedResources.includes(consumer)) {
                result.path.push(consumer)
                this.internalDPS(consumer, result)
            }
        })

        return result
    }
}
