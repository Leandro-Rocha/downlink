
export enum ResourceTypes {
    DOWNLINK = 'DOWNLINK',
    UPLINK = 'UPLINK',
    MEMORY = 'MEMORY',
    CPU = 'CPU',
    STORAGE = 'STORAGE',
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

    allocate(amount: number) {
        this.allocated += amount
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

export class Storage extends Resource {
    files: File[] = []

    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.STORAGE, capacity)
    }
}

export class Cpu extends Resource {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.CPU, capacity)
    }
}

export class Memory extends Resource {
    constructor(name: string, capacity: number) {
        super(name, ResourceTypes.MEMORY, capacity)
    }
}