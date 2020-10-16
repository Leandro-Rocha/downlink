import { DesktopWindow, DesktopWindowConfig } from "../../desktop-window.js"
import { Table } from "../../lib/html-helper.js"

export class PortsWindow extends DesktopWindow {
    hackedDbTable: HTMLTableElement
    hackedDbTableBody: HTMLTableSectionElement

    ftpInput: HTMLInputElement
    sshInput: HTMLInputElement


    constructor(config: DesktopWindowConfig) {
        super(config, ['window-ports'])

        const table = new Table()
        this.contentElement.appendChild(table.element)

        const ftpRow = table.body.tr
        ftpRow.td.text('FTP:21')
        this.ftpInput = ftpRow.td.input.value('@!#daf@##').id('ftp-input-password').element


        const sshRow = table.body.tr
        sshRow.td.text('SSH:22')
        this.sshInput = sshRow.td.input.value('1@#asf@41@').id('ftp-input-password').element


        this.hackedDbTable = table.element
        this.hackedDbTableBody = table.body.element
    }
}