import { Gui } from "../../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../../desktop-window.js"
import { TableHelper } from "../../lib/table-helper.js"
import { syncGuiAndDataArray } from "../gui-base"

export class PortsWindow extends DesktopWindow {
    // hackedDbTable: HTMLTableElement
    // hackedDbTableBody: HTMLTableSectionElement


    constructor(config: DesktopWindowConfig) {
        super(config, ['window-ports'])

        const list = document.createElement('ul')
        this.contentElement.appendChild(list)

        const ftp = document.createElement('li')
        list.appendChild(ftp)
        ftp.innerText = 'FTP:21'

        const ssh = document.createElement('li')
        list.appendChild(ssh)
        ssh.innerText = 'SSH:22'

        // const table = new TableHelper(this.contentElement)

        // table.body.tr.td.text('FTP').td.text('21')
        // table.body.tr.td.text('SSH').td.text('22')

        // this.hackedDbTable = table.element
        // this.hackedDbTableBody = table.body.element
    }

    updateContent(data: Gui.HackedDB): void {
        // syncGuiAndDataArray(data.entries, this.entries, (newElement) => this.hackedDbTable.appendChild(newElement.element))
    }

}