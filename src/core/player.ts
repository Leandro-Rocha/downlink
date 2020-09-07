import { Gateway } from "./gateway"

export class Player {
    name: string
    gateway: Gateway

    constructor(name: string) {
        this.name = name
        this.gateway = new Gateway(this, '127.0.0.1')
    }
}
