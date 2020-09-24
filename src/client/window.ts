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

    test: string

    constructor(config: WindowConfig) {
        this.id = config.id
        this.title = config.title
        this.x = config.x || getWindowData(this.id)?.x || '100px'
        this.y = config.y || getWindowData(this.id)?.y || '100px'

        const newWindow = createWindow(this)
        this.windowElement = newWindow.windowElement
        this.headerElement = newWindow.headerElement
        this.contentElement = newWindow.contentElement

        this.test = 'oi'

        var _test: string
        Object.defineProperty(this, 'test', {
            get() {
                return _test
            },
            set(newValue) {
                console.log(`new value of test is [${newValue}]`)
                _test = newValue
            }
        })
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

    //  Brings clicked window to top level
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

    document.addEventListener("mouseup", function () {
        const x = Math.max(styleToNumber(draggingWindow!.style.left)!, 0)
        const y = Math.max(styleToNumber(draggingWindow!.style.top)!, 0)

        draggingWindowObject.x = numberToString(x, { suffix: 'px' })
        draggingWindowObject.y = numberToString(y, { suffix: 'px' })

        draggingWindowObject.savePosition()
        document.removeEventListener("mousemove", move, false);
    }, false)

    return { windowElement: windowDiv, headerElement: headerDiv, contentElement: contentDiv }
}

function move(e: MouseEvent) {
    if (!draggingWindow) return

    const posX = (e.pageX - mouseX) >= 0 ? (e.pageX - mouseX) : 0
    const posY = (e.pageY - mouseY) >= 0 ? (e.pageY - mouseY) : 0

    draggingWindow.style.left = posX + 'px'
    draggingWindow.style.top = posY + 'px'
}

function styleToNumber(value: string) {
    const match = value.match(/\d*/)
    if (match) return Number(match[0])
}

function numberToString(value: number, options?: { prefix?: string, suffix?: string }) {
    return `${options?.prefix || ''}${value}${options?.suffix || ''}`
}