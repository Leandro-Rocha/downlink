import { Gui } from "../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../desktop-window.js"
import { syncGuiAndDataArray as syncGuiAndDataArray } from "../internals.js"
import { TableHelper } from "../lib/table-helper.js"
import { FileGuiElement } from "./gui-file.js"
import { StateAware } from "./gui-game-state.js"


export class FileManagerWindow extends DesktopWindow implements StateAware<Gui.Storage> {
    fileList: FileGuiElement[] = []

    fileTable: HTMLTableElement
    fileTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-file-manager'])

        const table = new TableHelper(this.contentElement)

        table.header.tr
            .td.text('File Name')
            .td.text('Size').class('file-size-header')

        this.fileTable = table.element
        this.fileTableBody = table.body.element
    }

    updateState(state?: Gui.Storage): void {
        syncGuiAndDataArray(state?.files || [], this.fileList, (newElement) => this.fileTableBody.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}