import { Gui } from "../../../common/types.js"
import { connectToGateway } from "../../client.js"
import { Paragraph, TableRow } from "../../lib/html-helper.js"
import { GuiElement } from "../gui-base.js"
import { Icon, IconType } from "../gui-icon.js"


export class HackedDbEntryGuiElement extends GuiElement<Gui.HackedDbEntry>{
    element: HTMLTableRowElement
    hostname: Paragraph
    ip: Paragraph
    connectButton: Icon

    constructor() {
        super()

        const row = new TableRow()
        const cell = row.td
        this.element = row.element

        this.hostname = cell.p
        cell.br
        this.ip = cell.p

        const actionsCell = row.td.addClass('actions-cell')

        this.connectButton = new Icon(IconType.link)
        actionsCell.element.appendChild(this.connectButton.element)
        this.connectButton.addClass('connect-button')

        this.connectButton.element.addEventListener('click', (event) => connectToGateway(this.ip.element.textContent!))

    }

    updateContent(data: Gui.HackedDbEntry): void {
        this.data = data
        this.hostname.text(this.data.hostname)
        this.ip.text(this.data.ip)
    }
}