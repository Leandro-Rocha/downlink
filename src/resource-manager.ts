import Resource from "./resource";
import { Observer } from "./signal-handler";
import { NetworkProcess, NetworkInterface } from "../test/game-interfaces";

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
    static reallocationList: NetworkInterface[] = []
    static resourceMatrix: ResourceMatrix = new ResourceMatrix()
    static observer: Observer = new Observer()

    static addToReallocation(...networkInterfaces: NetworkInterface[]) {
        if (networkInterfaces === undefined) return

        networkInterfaces.forEach(n => {
            if (!ResourceManager.reallocationList.includes(n)) {
                ResourceManager.reallocationList.push(n)
            }
        })
    }

    static processReallocationList() {

        while (ResourceManager.reallocationList.length > 0) {
            const networkInterface = ResourceManager.reallocationList.shift()
            if (networkInterface === undefined) return

            // Removes all allocations from that all processes belonging to this interface
            networkInterface.processes.forEach(p => {
                const currentAllocation = ResourceManager.getAllocationByPair(p, p.pair) || 0

                p.free(currentAllocation)
                p.pair.free(currentAllocation)
            })

            // Update its fairShare considering consumers free allocations
            networkInterface.updateFairShare()

            networkInterface.processes.forEach(process => {
                const pair = process.pair

                const desiredAllocation = ResourceManager.resourceMatrix.getOrientedAllocation(`${process.pid}-${pair.pid}`)

                // Consumer does not have enough capacity, redistribute what it have 
                if (!pair.canAllocate(desiredAllocation)) {
                    console.log(`Adding ${pair.pid} to the list as it cannot allocate ${desiredAllocation}. [${pair.getFreeCapacity()}] left`)
                    ResourceManager.addToReallocation(pair.networkLink)
                    return
                }

                // console.log(`${resource.pid}-${consumer.pid}:${desiredAllocation}`)

                process.allocate(desiredAllocation)
                pair.allocate(desiredAllocation)

                this.setAllocationByPair(process, pair, desiredAllocation)
                ResourceManager.resourceMatrix.removeOrientedEntry(`${process.pid}-${pair.pid}`)
                ResourceManager.resourceMatrix.removeOrientedEntry(`${pair.pid}-${process.pid}`)

                ResourceManager.reallocationList = ResourceManager.reallocationList.filter(p => p !== process.networkLink && p !== pair.networkLink)



                // TODO this is because unused resources
                // if (process.allocated < process.getCapacity()) {
                //     ResourceManager.addToReallocation(pair.networkLink)
                // }

                if (process.allocated > process.getCapacity()) {
                    return
                }

                // if (process.bounceInfo !== undefined && process.allocated === process.bounceInfo.sharedAllocation) {
                //     return
                // }

                // If consumer still have capacity to allocate, give it a chance to redistribute
                if (pair.getFreeCapacity() !== 0) {
                    console.log(`Adding ${pair.pid} to the list as it has [${pair.getFreeCapacity()}] left`)

                    ResourceManager.addToReallocation(pair.networkLink)
                }
            })

            networkInterface.processes.forEach(process => {

                if (process.bounceInfo !== undefined) {

                    console.log(process.bounceInfo.chain
                        .filter(p => p.allocated != process.bounceInfo.sharedAllocation)
                        .map(p => p.pid))





                    const minLink = process.bounceInfo.chain
                        .filter(p => p.allocated > 0)
                        .sort((p1, p2) => p1.allocated - p2.allocated).shift()

                    if (minLink !== undefined) {
                        if (minLink.allocated !== process.bounceInfo.sharedAllocation) {
                            process.bounceInfo.sharedAllocation = minLink.allocated || Number.MAX_VALUE
                            process.bounceInfo.chain.forEach(p => ResourceManager.addToReallocation(p.networkLink))

                        }
                    }
                }

            })

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
