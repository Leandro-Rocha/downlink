import { guiBase } from "./gui.js"


export class GuiHeader {
    element: HTMLDivElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('guiHeader')
        guiBase.appendChild(this.element)
    }
}