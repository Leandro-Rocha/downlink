import { Gui } from "../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../desktop-window.js"
import { syncGuiAndDataArray } from "../internals.js"
import { Table } from "../lib/html-helper.js"
import { StateAware } from "./gui-game-state.js"
import { LogEntryGuiElement } from "./gui-log-entry.js"

export class LogWindow extends DesktopWindow implements StateAware<Gui.Log> {

    entries: LogEntryGuiElement[] = []
    logTable: HTMLTableElement
    logTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-log'])

        const table = new Table()
        this.contentElement.appendChild(table.element)

        const headerRow = table.header.tr
        headerRow.td.text('Timestamp')
        headerRow.td.text('Message')

        this.logTable = table.element
        this.logTableBody = table.body.element
    }

    updateState(state?: Gui.Log): void {
        syncGuiAndDataArray(state?.entries || [], this.entries, (newElement) => this.logTableBody.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}


