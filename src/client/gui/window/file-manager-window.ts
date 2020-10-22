import { IconType } from "../gui-icon.js"
import { Gui } from "../../../common/types.js"
import { Table } from "../../lib/html-helper.js"
import { StateAware } from "../gui-game-state.js"
import { FileGuiElement } from "./file-manager-entry.js"
import { addCssRule, } from "../../lib/css-helper.js"
import { DesktopWindow, DesktopWindowConfig } from "../../desktop-window.js"
import { syncGuiAndDataArray as syncGuiAndDataArray } from "../../internals.js"


addCssRule('.windowFileManager',
    {
        width: '500px',
        height: '300px',
    }
)

addCssRule('.fileSizeHeader',
    { width: '85px', }
)


export class FileManagerWindow extends DesktopWindow implements StateAware<Gui.Storage> {
    fileList: FileGuiElement[] = []

    fileTable: Table

    constructor(config: DesktopWindowConfig) {
        super(config, ['windowFileManager'])

        this.fileTable = this.content.table
        this.fileTable.addClass('test')

        const headerRow = this.fileTable.header.tr
        headerRow.td.text('File Name')
        headerRow.td.text('Type')
        headerRow.td.text('Size').addClass('fileSizeHeader')

    }

    getIcon(): IconType { return IconType.folder }

    updateState(state?: Gui.Storage): void {
        syncGuiAndDataArray(state?.files || [], this.fileList, (newElement) => this.fileTable.body.element.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}