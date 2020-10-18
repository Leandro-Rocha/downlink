import { DesktopWindow, DesktopWindowConfig } from "../../desktop-window.js"
import { IconType } from "../gui-icon.js"

export class PortsWindow extends DesktopWindow {
    hackedDbTable: HTMLTableElement
    hackedDbTableBody: HTMLTableSectionElement

    ftpInput: HTMLInputElement
    sshInput: HTMLInputElement


    constructor(config: DesktopWindowConfig) {
        super(config, ['window-ports'])

        const table = this.content.table

        const ftpRow = table.body.tr
        ftpRow.td.text('FTP:21')
        this.ftpInput = ftpRow.td.input.value('@!#daf@##').id('ftp-input-password').element


        const sshRow = table.body.tr
        sshRow.td.text('SSH:22')
        this.sshInput = sshRow.td.input.value('1@#asf@41@').id('ssh-input-password').element


        this.hackedDbTable = table.element
        this.hackedDbTableBody = table.body.element
    }

    getIcon(): IconType { return IconType.userSecret }
}