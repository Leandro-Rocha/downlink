import { Gui } from "../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../desktop-window.js"
import { syncGuiAndDataArray } from "../internals.js"
import { TableHelper } from "../lib/table-helper.js"
import { StateAware } from "./gui-game-state.js"
import { LogEntryGuiElement } from "./gui-log-entry.js"

export class LogWindow extends DesktopWindow implements StateAware<Gui.Log> {

    entries: LogEntryGuiElement[] = []
    logTable: HTMLTableElement
    logTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-log'])

        const table = new TableHelper(this.contentElement)

        table.header.tr
            .td.text('Timestamp')
            .td.text('Message')

        this.logTable = table.element
        this.logTableBody = table.body.element
    }

    updateState(state?: Gui.Log): void {
        syncGuiAndDataArray(state?.entries || [], this.entries, (newElement) => this.logTableBody.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}


