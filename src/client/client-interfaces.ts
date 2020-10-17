import { EntityType, GameEntity } from "../common/types.js"
import { WorkerProcessGuiElement } from "./gui/gui-worker-process.js"
import { LogEntryGuiElement } from "./gui/window/log-entry.js"
import { FileGuiElement } from "./gui/window/file-manager-entry.js"
import { SoftwareGuiElement } from "./gui/gui-software.js"
import { PasswordCrackerGuiElement } from "./gui/gui-password-cracker.js"
import { GuiElement } from "./internals.js"
import { HackedDbEntryGuiElement } from "./gui/window/hacked-db-entry.js"

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

    if (type === EntityType.FILE) {
        return new FileGuiElement()
    }

    if (type === EntityType.SOFTWARE_NETWORK_SCANNER) {
        return new SoftwareGuiElement()
    }

    if (type === EntityType.SOFTWARE_CRACKER) {
        return new PasswordCrackerGuiElement()
    }

    throw new Error(`Software type [${type}] does not exists`)
}

