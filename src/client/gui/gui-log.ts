import { Gui } from "../../common/types.js"
import { Window, WindowConfig } from "../window.js"
import { LogEntryGuiElement } from "./gui-log-entry.js"





export class LogWindow extends Window<Gui.Log> {

    entries: LogEntryGuiElement[] = []
    logTable: HTMLTableElement
    logTableBody: HTMLTableSectionElement

    constructor(config: WindowConfig) {
        super(config)

        this.element.classList.add('window-log')
        this.contentElement.classList.add('window-log-content')

        this.logTable = document.createElement('table')
        this.logTable.innerHTML = `<thead><td id='timestamp_header' >Timestamp</td><td>Message</td></thead>`

        this.logTableBody = document.createElement('tbody')
        this.logTable.appendChild(this.logTableBody)

        this.contentElement.appendChild(this.logTable)
    }

    updateContent(data: Gui.Log): void {
        this.syncGuiAndData(data.entries, this.entries, (newElement) => this.logTableBody.appendChild(newElement.element))
    }
}