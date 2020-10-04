import { Gui } from "../../common/types.js"
import { GuiElement } from "./gui-base.js"






export class HackedDbEntryGuiElement extends GuiElement<Gui.HackedDbEntry>{
    element: HTMLElement
    ipElement: HTMLElement

    constructor() {
        super()
        this.element = document.createElement('tr')
        this.ipElement = this.element.appendChild(document.createElement('td'))
    }

    updateContent(data: Gui.HackedDbEntry): void {
        this.data = data

        this.ipElement.textContent = this.data.ip
    }
}