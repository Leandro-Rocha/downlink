import { socketEvents, PlayerActions } from "../../common/constants.js"
import { Types } from "../../common/types.js"
import { socket } from "../socket.js"
import { Window } from "../window.js"


export class FileManagerWindow extends Window<Types.Storage> {

    updateContent(content: Types.Storage): void {
        this.contentElement.innerHTML = ''
        const fileList = document.createElement('ul')
        this.contentElement.appendChild(fileList)

        fileList.childNodes.forEach(c => c.remove())

        content.files.forEach(f => {
            const fileElement = document.createElement('li')
            fileElement.innerHTML = `<button>${f.name}</button>`
            console.log('created')

            fileElement.addEventListener('click', () => {
                //TODO: hardcoded username input
                const userName = (<HTMLInputElement>document.querySelector('#userNameInput')).value
                socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.EXECUTE_SOFTWARE, f.id, userName)
            })
            fileList.appendChild(fileElement)
        })
    }
}