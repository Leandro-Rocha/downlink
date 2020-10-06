import { Gui } from "../../common/types.js"
import { Window, WindowConfig } from "../window.js"
import { HackedDbEntryGuiElement } from "./gui-hacked-db-entry.js"





export class HackedDbWindow extends Window<Gui.HackedDB> {

    entries: HackedDbEntryGuiElement[] = []
    hackedDbTable: HTMLTableElement

    constructor(config: WindowConfig) {
        super(config)

        this.hackedDbTable = document.createElement('table')
        this.hackedDbTable.innerHTML = '<thead><td>IP</td></thead>'

        this.contentElement.appendChild(this.hackedDbTable)
    }

    updateContent(data: Gui.HackedDB): void {
        this.syncGuiAndData(data.entries, this.entries, (newElement) => this.hackedDbTable.appendChild(newElement.element))
    }

    getDefaultPosition() {
        return { width: 500 }
    }
}