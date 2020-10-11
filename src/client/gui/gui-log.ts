import { Gui } from "../../common/types.js"
import { syncGuiAndData } from "../internals.js"
import { Window, WindowConfig } from "../window.js"
import { StateAware } from "./gui-game-state.js"
import { LogEntryGuiElement } from "./gui-log-entry.js"

export class LogWindow extends Window<Gui.Log> implements StateAware<Gui.Log> {

    entries: LogEntryGuiElement[] = []
    logTable: HTMLTableElement
    logTableBody: HTMLTableSectionElement

    constructor(config: WindowConfig) {
        super(config)

        this.element.classList.add('window-log')

        this.logTable = document.createElement('table')
        this.logTable.innerHTML = `<thead><td id='timestamp_header' >Timestamp</td><td>Message</td></thead>`

        this.logTableBody = document.createElement('tbody')
        this.logTable.appendChild(this.logTableBody)

        this.contentElement.appendChild(this.logTable)
    }

    updateState(state?: Gui.Log): void {

        if (state) {
            syncGuiAndData(state.entries, this.entries, (newElement) => this.logTableBody.appendChild(newElement.element))
        }
    }

    getDefaultPosition() {
        return { width: 500 }
    }
}


