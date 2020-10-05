import { Gui } from "../../common/types.js"
import { GuiElement } from "./gui-base.js"

export class FileGuiElement extends GuiElement<Gui.File>{
    element: HTMLElement
    fileNameElement: HTMLElement
    fileSizeElement: HTMLElement

    constructor() {
        super()
        this.element = document.createElement('tr')
        this.fileNameElement = this.element.appendChild(document.createElement('td'))
        this.fileSizeElement = this.element.appendChild(document.createElement('td'))
    }

    updateContent(data: Gui.File): void {
        this.data = data

        this.fileNameElement.textContent = this.data.name
        this.fileSizeElement.textContent = this.data.size.toString()
    }
}