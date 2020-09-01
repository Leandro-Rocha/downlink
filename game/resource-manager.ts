import Resource from "./resource";
import { Observer } from "./signal-handler";

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
    static reallocationList: Resource[] = []
    static resourceMatrix: ResourceMatrix = new ResourceMatrix()
    static observer: Observer = new Observer()

    static addResources(...resources: Resource[]) {
        if (resources === undefined) return

        ResourceManager.resourceList.push(...resources)

        resources.forEach(r1 => r1.consumers.forEach(r2 => {
            this.setAllocationByPair(r1, r2, 0)
        }))
    }

    static processReallocationList() {

        while (ResourceManager.reallocationList.length > 0) {
            const resource = ResourceManager.reallocationList.shift()
            if (resource === undefined) return

            // Removes all allocations from that consumer / zero allocation
            resource.allocated = 0
            resource.consumers.forEach(consumer => {
                const currentAllocation = ResourceManager.getAllocationByPair(resource, consumer) || 0
                consumer.free(currentAllocation)
            })

            // Update its fairShare considering consumers free allocations
            resource.updateFairShare()

            resource.consumers.forEach(consumer => {
                const desiredAllocation = ResourceManager.resourceMatrix.getOrientedAllocation(`${resource.id}-${consumer.id}`)

                if (consumer.canAllocate(desiredAllocation)) {

                    resource.allocate(desiredAllocation)
                    consumer.allocate(desiredAllocation)
                    this.setAllocationByPair(resource, consumer, desiredAllocation)
                    ResourceManager.resourceMatrix.removeOrientedEntry(`${resource.id}-${consumer.id}`)
                    ResourceManager.resourceMatrix.removeOrientedEntry(`${consumer.id}-${resource.id}`)

                    // If consumer still have capacity to allocate, give it a chance to redistribute
                    if (consumer.freeCapacity() !== 0) {
                        ResourceManager.reallocationList.push(consumer)
                    }
                }
                else {
                    // Consumer does not have enough capacity, redistribute what it have
                    ResourceManager.reallocationList.push(consumer)
                }
            })
        }
    }

    static linkResources(resourceA: Resource, resourceB: Resource) {
        resourceA.addConsumer(resourceB)
        resourceB.addConsumer(resourceA)

        ResourceManager.reallocationList.push(resourceA)
    }


    static unlinkResources(resourceA: Resource, resourceB: Resource) {
        resourceA.removeConsumer(resourceB)
        resourceB.removeConsumer(resourceA)
        this.resourceMatrix.removeEntry(this.getMatrixIndex(resourceA, resourceB))

        ResourceManager.reallocationList.push(resourceA)
        ResourceManager.reallocationList.push(resourceB)
    }

    static removeResources(...resources: Resource[]) {
        ResourceManager.resourceList = ResourceManager.resourceList.filter(r => !resources.includes(r))

        resources.forEach(r => {
            if (r.consumers.length > 0) {
                console.error(`Cannot remove resource [${r.id}] from matrix as it still have consumers:[${r.consumers.map(c => c.id)}]`)
            }
            else {
                this.resourceMatrix.getAllocationsForResource(r.id)
                    ?.forEach(index => this.resourceMatrix.removeEntry(index))
            }
        })
    }

    private static getMatrixIndex(resourceA: Resource, resourceB: Resource) {
        return [resourceA.id, resourceB.id].sort().join('-')
    }

    static getAllocationByPair(resourceA: Resource, resourceB: Resource) {
        return ResourceManager.resourceMatrix.getAllocation(ResourceManager.getMatrixIndex(resourceA, resourceB))
    }

    static setAllocationByPair(resourceA: Resource, resourceB: Resource, value: number) {
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
