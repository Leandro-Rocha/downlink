import Resource from "./resource";
import { resetHistory } from "sinon";
import { Observer } from "./signal-handler";

class ResourceMatrix {
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

    removeOrientedAllocationsForResource(id: string) {
        if (id === undefined || id.length === 0) return
        Object.keys(this.orientedMatrix)
            .filter(index => index.includes(id))
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
    static resourceMatrix: ResourceMatrix = new ResourceMatrix()
    static observer: Observer = new Observer()

    static addResources(...resources: Resource[]) {
        if (resources === undefined) return

        ResourceManager.resourceList.push(...resources)

        resources.forEach(r1 => r1.consumers.forEach(r2 => {
            this.setAllocationByPair(r1, r2, 0)
        }))
    }

    static linkResources(resourceA: Resource, resourceB: Resource) {
        resourceA.addConsumer(resourceB)
        resourceB.addConsumer(resourceA)

        resourceA.updateOriented()
    }

    static unlinkResources(resourceA: Resource, resourceB: Resource) {
        resourceA.removeConsumer(resourceB)
        resourceB.removeConsumer(resourceA)

        console.log('==========================================')

        console.log(this.resourceMatrix.allocationMatrix)
        console.log(this.resourceMatrix.orientedMatrix)

        this.resourceMatrix.removeEntry(this.getMatrixIndex(resourceA, resourceB))
        this.resourceMatrix.removeOrientedAllocationsForResource(resourceA.id)
        this.resourceMatrix.removeOrientedAllocationsForResource(resourceB.id)
        
        console.log('==========================================')
        console.log(this.resourceMatrix.allocationMatrix)
        console.log(this.resourceMatrix.orientedMatrix)

        resourceA.updateOriented()
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
        this.getResourceNetwork(resource).forEach(r => r.updateAllocation())
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
