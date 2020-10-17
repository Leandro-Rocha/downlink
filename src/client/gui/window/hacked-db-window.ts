import { Gui } from "../../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../../desktop-window.js"
import { syncGuiAndDataArray } from "../../internals.js"
import { Table } from "../../lib/html-helper.js"
import { HackedDbEntryGuiElement } from "./hacked-db-entry.js"


export class HackedDbWindow extends DesktopWindow {

    entries: HackedDbEntryGuiElement[] = []
    hackedDbTable: HTMLTableElement
    hackedDbTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-hacked-db'])

        const table = this.content.table

        table.header.tr
            .td.text('IP').addClass('ip-header')

        this.hackedDbTable = table.element
        this.hackedDbTableBody = table.body.element
    }

    updateContent(data: Gui.HackedDB): void {
        syncGuiAndDataArray(data.entries, this.entries, (newElement) => this.hackedDbTable.appendChild(newElement.element))
    }

}