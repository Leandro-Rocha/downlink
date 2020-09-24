import { socket } from './socket.js'
import { PlayerActions, socketEvents } from '../common/constants.js'
import { Types } from '../common/types.js'

// if (!localStorage.getItem('windowPositions')) {
//     localStorage.setItem('windowPositions', JSON.stringify('{}'))

// }

function setWindowData(window: Window<never>) {
    if (!localStorage.getItem('windowData')) {
        localStorage.setItem('windowData', '{}')
    }

    const windowData: { [key: string]: { x: string, y: string } } = JSON.parse(localStorage.getItem('windowData')!)
    windowData[window.id] = { x: window.x, y: window.y }

    localStorage.setItem('windowData', JSON.stringify(windowData))
}

function getWindowData(id: string) {
    if (!localStorage.getItem('windowData')) {
        localStorage.setItem('windowData', '{}')
    }

    const windowData: { [key: string]: { x: string, y: string } } = JSON.parse(localStorage.getItem('windowData')!)
    return windowData[id]
}

var mouseX: number
var mouseY: number
var draggingWindow: HTMLElement | null
var draggingWindowObject: Window<never>

function move(e: MouseEvent) {
    if (!draggingWindow) return

    draggingWindow.style.left = e.pageX - mouseX + 'px'
    draggingWindow.style.top = e.pageY - mouseY + 'px'
}

type WindowConfig = {
    id: string
    title: string
    x?: string
    y?: string
}

abstract class Window<T> {
    windowElement: HTMLDivElement
    headerElement: HTMLDivElement
    contentElement: HTMLDivElement

    id: string
    title: string
    x: string
    y: string

    constructor(config: WindowConfig) {
        this.id = config.id
        this.title = config.title
        this.x = config.x || getWindowData(this.id).x || '100px'
        this.y = config.y || getWindowData(this.id).y || '100px'

        const newWindow = createWindow(this)
        this.windowElement = newWindow.windowElement
        this.headerElement = newWindow.headerElement
        this.contentElement = newWindow.contentElement
    }


    savePosition() {
        setWindowData(this)
    }

    abstract updateContent(content: T): void
}

export class FileManagerWindow extends Window<Types.Storage> {

    updateContent(content: Types.Storage): void {
        this.contentElement.innerHTML = ''
        const fileList = document.createElement('ul')
        this.contentElement.appendChild(fileList)

        fileList.childNodes.forEach(c => c.remove())

        content.files.forEach(f => {
            const fileElement = document.createElement('li')
            fileElement.innerHTML = `<button>${f.name}</button>`


            fileElement.addEventListener('click', () => {
                //TODO: hardcoded username input
                const userName = (<HTMLInputElement>document.querySelector('#userNameInput')).value
                socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.EXECUTE_SOFTWARE, f.id, userName)
            })
            fileList.appendChild(fileElement)
        })
    }
}

type CreateWindowResult = {
    windowElement: HTMLDivElement
    headerElement: HTMLDivElement
    contentElement: HTMLDivElement
}
export function createWindow(window: Window<never>): CreateWindowResult {
    const windowDiv = document.createElement('div')
    windowDiv.id = window.id
    windowDiv.classList.add('window')
    document.body.appendChild(windowDiv)

    const headerDiv = document.createElement('div')
    headerDiv.classList.add('header')
    windowDiv.appendChild(headerDiv)

    const contentDiv = document.createElement('div')
    windowDiv.appendChild(contentDiv)

    const headerTitleDiv = document.createElement('span')
    headerTitleDiv.textContent = window.title
    headerDiv.appendChild(headerTitleDiv)

    windowDiv.style.left = window.x
    windowDiv.style.top = window.y



    //  Bring clicked window to top level
    windowDiv.style.zIndex = document.querySelectorAll('.window').length.toString()
    windowDiv.addEventListener("mousedown", function (e) {
        e.preventDefault()
        const allWindows = (<NodeListOf<HTMLDivElement>>document.querySelectorAll('.window'))

        allWindows.forEach((e: HTMLDivElement) => {
            if (e.style.zIndex > windowDiv.style.zIndex) {
                var zIndex = Number(e.style.zIndex)
                e.style.zIndex = (--zIndex).toString()
            }
        })

        windowDiv.style.zIndex = document.querySelectorAll('.window').length.toString()
    })

    headerDiv.addEventListener("mousedown", function (e) {
        mouseX = e.offsetX
        mouseY = e.offsetY
        draggingWindow = (<HTMLElement>e.target).parentElement
        draggingWindowObject = window

        document.addEventListener("mousemove", move, false);
    }, false)

    headerDiv.addEventListener("mouseup", function () {
        draggingWindowObject.x = draggingWindow?.style.left || '100px'
        draggingWindowObject.y = draggingWindow?.style.top || '100px'
        draggingWindowObject.savePosition()
        document.removeEventListener("mousemove", move, false);
    }, false)

    return { windowElement: windowDiv, headerElement: headerDiv, contentElement: contentDiv }
}