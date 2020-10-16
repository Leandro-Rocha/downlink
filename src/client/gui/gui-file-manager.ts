import { Gui } from "../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../desktop-window.js"
import { syncGuiAndDataArray as syncGuiAndDataArray } from "../internals.js"
import { Table } from "../lib/html-helper.js"
import { FileGuiElement } from "./gui-file.js"
import { StateAware } from "./gui-game-state.js"


export class FileManagerWindow extends DesktopWindow implements StateAware<Gui.Storage> {
    fileList: FileGuiElement[] = []

    fileTable: Table

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-file-manager'])

        this.fileTable = this.content.table

        const headerRow = this.fileTable.header.tr
        headerRow.td.text('File Name')
        headerRow.td.text('Type').addClass('type-header')
        headerRow.td.text('Size').addClass('file-size-header')

    }

    updateState(state?: Gui.Storage): void {
        syncGuiAndDataArray(state?.files || [], this.fileList, (newElement) => this.fileTable.body.element.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}