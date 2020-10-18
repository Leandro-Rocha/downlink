import { Gui } from "../../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../../desktop-window.js"
import { syncGuiAndDataArray } from "../../internals.js"
import { IconType } from "../gui-icon.js"
import { HackedDbEntryGuiElement } from "./hacked-db-entry.js"


export class NetworkWindow extends DesktopWindow {

    entries: HackedDbEntryGuiElement[] = []
    hackedDbTable: HTMLTableElement
    hackedDbTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-network'])

        const table = this.content.table

        const header = table.header.tr
        header.td.text('Gateway').addClass('gateway-header')
        header.td.text('Actions').addClass('actions-header')

        this.hackedDbTable = table.element
        this.hackedDbTableBody = table.body.element
    }
    
    getIcon(): IconType { return IconType.network }

    updateContent(data: Gui.HackedDB): void {
        syncGuiAndDataArray(data.entries, this.entries, (newElement) => this.hackedDbTable.appendChild(newElement.element))
    }

}