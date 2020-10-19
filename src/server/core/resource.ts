import faker from 'faker'
import { ResourceTypes } from "../../common/constants"
import { EntityType, GameEntity, Presentable, Gui } from "../../common/types"

export abstract class Resource implements GameEntity, Presentable<Gui.Resource> {
    id: string
    abstract entityType: EntityType

    name: string
    type: ResourceTypes
    capacity: number
    allocated: number

    constructor(config?: Partial<Resource>) {
        this.id = config?.id || faker.random.uuid()
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

    toClient(): GameEntity & Gui.Resource {
        return {
            id: this.id,
            entityType: this.entityType,

            name: this.name,
            type: this.type,
            capacity: this.capacity,
            allocated: this.allocated
        }
    }
}


export class File implements GameEntity, Presentable<Gui.File> {
    id: string
    entityType: EntityType = EntityType.FILE

    name: string
    type: string
    size: number

    constructor(config?: Partial<File>) {
        this.name = config?.name || faker.system.fileName()
        this.id = config?.id || `${this.name}_${Date.now()}`
        this.type = config?.type || 'unknown'
        this.size = config?.size || 0
    }

    toClient(): GameEntity & Gui.File {
        return {
            id: this.id,
            entityType: this.entityType,

            name: this.name,
            type: this.type,
            size: this.size,
        }
    }
}

export class Storage extends Resource implements Presentable<Gui.Storage> {
    entityType: EntityType = EntityType.RESOURCE_STORAGE
    files: File[] = []

    constructor(config?: Partial<Storage>) {
        super({ ...config, type: ResourceTypes.STORAGE })

        this.files = config?.files || []
    }
    toClient(): GameEntity & Gui.Storage {
        return {
            ...super.toClient(),
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
    entityType: EntityType = EntityType.RESOURCE_CPU

    constructor(name: string, capacity: number) {
        super({ name, capacity, type: ResourceTypes.CPU })
    }
}

export class Memory extends Resource {
    entityType: EntityType = EntityType.RESOURCE_MEMORY

    constructor(name: string, capacity: number) {
        super({ name, capacity, type: ResourceTypes.MEMORY })
    }
}