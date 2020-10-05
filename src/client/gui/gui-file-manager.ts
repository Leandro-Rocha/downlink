import { Gui } from "../../common/types.js"
import { Window, WindowConfig } from "../window.js"
import { FileGuiElement } from "./gui-file.js"


export class FileManagerWindow extends Window<Gui.Storage> {

    fileList: FileGuiElement[] = []

    fileTable: HTMLTableElement
    fileTableBody: HTMLTableSectionElement

    constructor(config: WindowConfig) {
        super(config)

        //TODO
        this.contentElement.classList.add('window-log-content')

        this.fileTable = document.createElement('table')
        this.fileTable.innerHTML = `<thead>
        <td id='timestamp_header' >File Name</td>
        <td>Size</td></thead>`

        this.fileTableBody = document.createElement('tbody')
        this.fileTable.appendChild(this.fileTableBody)

        this.contentElement.appendChild(this.fileTable)
    }

    updateContent(data: Gui.Storage): void {
        this.syncGuiAndData(data.files, this.fileList, (newElement) => this.fileTableBody.appendChild(newElement.element))
    }

    // updateContent(content: Gui.Storage): void {
    //     this.contentElement.innerHTML = ''
    //     const fileList = document.createElement('ul')
    //     this.contentElement.appendChild(fileList)

    //     fileList.childNodes.forEach(c => c.remove())

    //     content.files.forEach(f => {
    //         const fileElement = document.createElement('li')
    //         fileElement.innerHTML = `<button>${f.name}</button>`
    //         console.log('created')

    //         fileElement.addEventListener('click', () => {
    //             //TODO: hardcoded username input
    //             const userName = (<HTMLInputElement>document.querySelector('#userNameInput')).value
    //             socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.EXECUTE_SOFTWARE, f.id, userName)
    //         })
    //         fileList.appendChild(fileElement)
    //     })
    // }
}