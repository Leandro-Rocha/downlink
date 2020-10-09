import { GameEntity } from "../../common/types.js"
import { createClientElement } from "../internals.js"


declare global {
    interface Array<T> {
        remove(item: T): Array<T>;
    }
}

Array.prototype.remove = function (item) {
    this.splice(this.indexOf(item), 1)
    return this
}

export function createCSSRule(selector: string, style: string = '') {
    const documentStyleSheet = document.styleSheets[0]
    const ruleIndex = documentStyleSheet.insertRule(`${selector}{${style}}`)

    return documentStyleSheet.cssRules.item(ruleIndex)!
}


export abstract class GuiElement<T extends GameEntity> {
    data!: T
    abstract element: HTMLElement

    destroy() {
        this.element.remove()
    }

    abstract updateContent(data: T): void

    syncGuiAndData(data: GameEntity[], gui: GuiElement<GameEntity>[], newElementHandler?: (newElement: GuiElement<GameEntity>) => void) {

        const dataNewElements = [...data]
        const guiElementsToRemove = [...gui]

        // Identify items to be create or removed and update existing ones
        data.forEach(dataElem => {
            gui?.forEach(guiElem => {
                if (dataElem.id === guiElem.data.id) {

                    dataNewElements.remove(dataElem)
                    guiElementsToRemove.remove(guiElem)

                    guiElem.updateContent(dataElem)
                }
            })
        })

        dataNewElements.forEach(dataElem => {
            const newElement = createClientElement(dataElem.entityType)
            newElement.updateContent(dataElem)

            gui.push(newElement)

            if (newElementHandler !== undefined) newElementHandler(newElement)
        })

        guiElementsToRemove.forEach(guiElem => {
            guiElem.destroy()
            gui.remove(guiElem)
        })
    }
}


