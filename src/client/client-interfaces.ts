import { GuiElement } from "./gui/gui-base.js"
import { EntityType, GameEntity } from "../common/types.js"
import { WorkerProcessGuiElement } from "./gui/gui-worker-process.js"

export function createClientElement(type: EntityType): GuiElement<GameEntity> {
    if (type === EntityType.PROCESS_CRACKER) {

        return new WorkerProcessGuiElement()
    }

    throw new Error(`Software type [${type}] does not exists`)
}

