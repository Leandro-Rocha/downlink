import { GuiElement } from "./gui/gui-base.js"
import { EntityType, GameEntity } from "../common/types.js"
import { WorkerProcessGuiElement } from "./gui/gui-worker-process.js"
import { HackedDbEntryGuiElement } from "./gui/gui-hacked-db-entry.js"
import { LogEntryGuiElement } from "./gui/gui-log-entry.js"

export function createClientElement(type: EntityType): GuiElement<GameEntity> {
    if (type === EntityType.PROCESS_CRACKER) {
        return new WorkerProcessGuiElement()
    }

    if (type === EntityType.PROCESS_NETWORK_SCANNER) {
        return new WorkerProcessGuiElement()
    }

    if (type === EntityType.HACKED_DB_ENTRY) {
        return new HackedDbEntryGuiElement()
    }

    if (type === EntityType.LOG_ENTRY) {
        return new LogEntryGuiElement()
    }

    throw new Error(`Software type [${type}] does not exists`)
}

