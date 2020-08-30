import Resource from "./resource";
import { resetHistory } from "sinon";
import { Observer } from "./signal-handler";

class ResourceMatrix {
    private allocationMatrix: { [key: string]: number } = {}

    getAllocation(index: string) {
        return this.allocationMatrix[index]
    }

    setAllocation(index: string, value: number) {
        if (index === undefined || value === undefined) return
        this.allocationMatrix[index] = value
    }

    getAllocationsForResource(id: string) {
        if (id === undefined || id.length === 0) return
        return Object.keys(this.allocationMatrix).filter(index => index.includes(id))
    }

    removeEntry(index: string) {
        delete this.allocationMatrix[index]
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
