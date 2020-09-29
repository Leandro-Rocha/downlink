import { EntityType, GameEntity } from "../../common/types.js"
import { WorkerProcessGuiElement } from "./gui-task-manager.js"

export abstract class GuiElement<T extends GameEntity> {
    data: T
    abstract element: HTMLElement

    constructor(data: T) {
        this.data = data
    }

    destroy() {
        this.element.remove()
    }

    abstract updateContent(data?: T): void
}


export function syncGuiAndData(parent: HTMLElement, data: GameEntity[], gui: GuiElement<GameEntity>[]) {

    const dataNewElements = [...data]
    const guiElementsToRemove = [...gui]

    data.forEach(dataElem => {
        gui?.forEach(guiElem => {
            if (dataElem.gameId === guiElem.data.gameId) {
                dataNewElements.remove(dataElem)
                guiElementsToRemove.remove(guiElem)
                guiElem.data = dataElem
            }
        })
    })

    dataNewElements.forEach(dataElem => {
        const newElement = createClientElement(dataElem.entityType, dataElem)
        gui.push(newElement)
        newElement.updateContent()
        parent.appendChild(newElement.element)
    })

    guiElementsToRemove.forEach(guiElem => {
        guiElem.destroy()
        gui.remove(guiElem)
    })
}

function createClientElement(type: EntityType, data: any): GuiElement<GameEntity> {
    if (type === EntityType.PROCESS_CRACKER) {
        return new WorkerProcessGuiElement(data)
    }

    throw new Error(`Software type [${type}] does not exists`)
}