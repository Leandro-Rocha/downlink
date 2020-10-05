import { Gui } from "../../common/types.js"
import { GuiElement } from "./gui-base.js"




export class LogEntryGuiElement extends GuiElement<Gui.LogEntry>{
    element: HTMLElement
    timestampElement: HTMLElement
    messageElement: HTMLElement

    constructor() {
        super()
        this.element = document.createElement('tr')
        this.timestampElement = this.element.appendChild(document.createElement('td'))
        this.messageElement = this.element.appendChild(document.createElement('td'))
    }

    updateContent(data: Gui.LogEntry): void {
        this.data = data

        this.timestampElement.textContent = this.data.timestamp
        this.messageElement.textContent = this.data.message
    }
}