
//TODO revert names
export enum ResourceTypes {
    DOWNLINK = 'D',
    UPLINK = 'U',
    MEMORY = 'MEMORY',
    CPU = 'CPU',
    STORAGE = 'CPU',
}

export class Resource {
    name: string
    type: ResourceTypes
    capacity: number
    allocated: number

    constructor(name: string, type: ResourceTypes, capacity: number) {
        this.name = name
        this.type = type
        this.capacity = capacity
        this.allocated = 0
    }

    allocate(desiredAllocation: number) {
        this.allocated += desiredAllocation
    }

    free(amount: number) {
        this.allocated -= amount
    }

    canAllocate(amount: number): boolean {
        return amount + this.allocated <= this.capacity
    }

    freeCapacity() {
        return this.capacity - this.allocated
    }

}