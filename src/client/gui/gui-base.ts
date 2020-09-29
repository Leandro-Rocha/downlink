import { SoftwareTypes } from "../../common/constants.js"
import { Types } from "../../common/types.js"
import { WorkerProcessGuiElement } from "./gui-task-manager.js"

export abstract class GuiElement<T extends Types.GuiElementId> {
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


export function syncGuiAndData(parent: HTMLElement, data: Types.GuiElementId[], gui: GuiElement<Types.GuiElementId>[]) {

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
        const newElement = createClientElement(dataElem.type, dataElem)
        gui.push(newElement)
        newElement.updateContent()
        parent.appendChild(newElement.element)
    })

    guiElementsToRemove.forEach(guiElem => {
        guiElem.destroy()
        gui.remove(guiElem)
    })
}

function createClientElement(type: SoftwareTypes, data: any): GuiElement<Types.GuiElementId> {
    if (type === SoftwareTypes.CRACKER) {
        return new WorkerProcessGuiElement(data)
    }

    throw new Error(`Software type [${type}] does not exists`)
}