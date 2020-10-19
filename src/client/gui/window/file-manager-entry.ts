import { Gui } from "../../../common/types.js"
import { TableRow } from "../../lib/html-helper.js"
import { GuiElement } from "../gui-base.js"

export class FileGuiElement extends GuiElement<Gui.File>{
    element: HTMLElement
    fileNameElement: HTMLElement
    fileTypeElement: HTMLElement
    fileSizeElement: HTMLElement

    constructor() {
        super()

        const row = new TableRow()
        this.element = row.element

        this.fileNameElement = row.td.element
        this.fileTypeElement = row.td.element
        this.fileSizeElement = row.td.addClass('file-size').element
    }

    updateContent(data: Gui.File): void {
        this.data = data

        this.fileNameElement.textContent = this.data.name
        this.fileTypeElement.textContent = this.data.type
        this.fileSizeElement.textContent = this.data.size.toString()
    }
}