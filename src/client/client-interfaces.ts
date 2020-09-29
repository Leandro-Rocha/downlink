import { WorkerProcessGuiElement } from "./gui/gui-task-manager"

declare global {
    interface Array<T> {
        remove(item: T): Array<T>;
    }
}

Array.prototype.remove = function (item) {
    this.splice(this.indexOf(item), 1)
    return this
}

export namespace Client {
    export interface ProcessClientMap {
        'CRACKER': WorkerProcessGuiElement
    }
}
