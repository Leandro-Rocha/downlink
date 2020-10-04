import { Owner } from "../../common/types"


export class NPC implements Owner {
    name: string

    constructor(name: string) {
        this.name = name
    }
}

