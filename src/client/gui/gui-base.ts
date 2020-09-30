import { EntityType, GameEntity } from "../../common/types.js"
import { WorkerProcessGuiElement } from "./gui-task-manager.js"

export abstract class GuiElement<T extends GameEntity> {
    data!: T
    abstract element: HTMLElement

    destroy() {
        this.element.remove()
    }

    abstract updateContent(data: T): void
}


export function syncGuiAndData(parent: HTMLElement, data: GameEntity[], gui: GuiElement<GameEntity>[]) {

    const dataNewElements = [...data]
    const guiElementsToRemove = [...gui]

    data.forEach(dataElem => {
        gui?.forEach(guiElem => {
            if (dataElem.id === guiElem.data.id) {
                dataNewElements.remove(dataElem)
                guiElementsToRemove.remove(guiElem)
                guiElem.data = dataElem
            }
        })
    })

    dataNewElements.forEach(dataElem => {
        const newElement = createClientElement(dataElem.entityType)
        newElement.updateContent(dataElem)
        gui.push(newElement)
        parent.appendChild(newElement.element)
    })

    guiElementsToRemove.forEach(guiElem => {
        guiElem.destroy()
        gui.remove(guiElem)
    })
}

function createClientElement(type: EntityType): GuiElement<GameEntity> {
    if (type === EntityType.PROCESS_CRACKER) {
        return new WorkerProcessGuiElement()
    }

    throw new Error(`Software type [${type}] does not exists`)
}