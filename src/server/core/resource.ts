import faker from 'faker'
import { ResourceTypes } from "../../common/constants"
import { Types } from "../../common/types"

export class Resource {
    name: string
    type: ResourceTypes
    capacity: number
    allocated: number

    constructor(config?: Partial<Types.Resource>) {
        this.name = config?.name || 'UNDEFINED_RESOURCE'
        this.type = config?.type || ResourceTypes.CPU
        this.capacity = config?.capacity || 0
        this.allocated = config?.allocated || 0
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


export class File implements Types.File {
    id: string
    name: string
    size: number

    constructor(config?: Partial<Types.File>) {
        this.id = config?.id || faker.random.uuid()
        this.name = config?.name || faker.system.fileName()
        this.size = config?.size || 0
    }

    toClient(): Partial<Types.File> {
        return <Partial<Types.File>>{
            id: this.id,
            name: this.name,
            size: this.size
        }
    }
}

export class Storage extends Resource implements Types.Storage {
    files: File[] = []

    constructor(config?: Partial<Types.Storage>) {
        super({ ...config, type: ResourceTypes.STORAGE })

        this.files = config?.files || []
    }

    toClient(): Partial<Types.Storage> {
        return <Partial<Types.Storage>>{
            files: this.files.map(f => f.toClient())
        }
    }
}

interface ExecutableRequirement {
    processor: number
    memory: number
    remoteConnection?: boolean
}

// export class Executable extends File {
//     requirements: ExecutableRequirement

//     constructor(name: string, size: number, requirements: ExecutableRequirement) {
//         super(name, size)

//         this.requirements = requirements
//     }
// }

export class CPU extends Resource {
    constructor(name: string, capacity: number) {
        super({ name, capacity, type: ResourceTypes.CPU })
    }
}

export class Memory extends Resource {
    constructor(name: string, capacity: number) {
        super({ name, capacity, type: ResourceTypes.MEMORY })
    }
}