import { Gui } from "../../common/types.js"
import { syncGuiAndData as syncGuiAndDataArray } from "../internals.js"
import { Window, WindowConfig } from "../window.js"
import { FileGuiElement } from "./gui-file.js"
import { StateAware } from "./gui-game-state.js"


export class FileManagerWindow extends Window<Gui.Storage> implements StateAware<Gui.Storage> {
    fileList: FileGuiElement[] = []

    fileTable: HTMLTableElement
    fileTableBody: HTMLTableSectionElement

    constructor(config: WindowConfig) {
        super(config)

        this.fileTable = document.createElement('table')
        this.fileTable.innerHTML = `<thead>
        <td id='timestamp_header'>File Name</td>
        <td>Size</td></thead>`

        this.fileTableBody = document.createElement('tbody')
        this.fileTable.appendChild(this.fileTableBody)

        this.contentElement.appendChild(this.fileTable)
    }

    updateState(state?: Gui.Storage): void {
        if (state) {
            syncGuiAndDataArray(state.files, this.fileList, (newElement) => this.fileTableBody.appendChild(newElement.element))

            this.element.classList.remove('hidden')
            this.minimizedElement.classList.remove('hidden')
        }
        else {
            syncGuiAndDataArray([], this.fileList)
            this.element.classList.add('hidden')
            this.minimizedElement.classList.add('hidden')
        }
    }


    getDefaultPosition() {
        return { width: 500 }
    }
}