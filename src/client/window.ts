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

    const windowData: { [key: string]: WindowConfig } = JSON.parse(localStorage.getItem('windowData')!)
    windowData[window.id] = window

    localStorage.setItem('windowData', JSON.stringify(windowData))
}

function getWindowData(id: string) {
    if (!localStorage.getItem('windowData')) {
        localStorage.setItem('windowData', '{}')
    }

    const windowData: { [key: string]: WindowConfig } = JSON.parse(localStorage.getItem('windowData')!)
    return windowData[id]
}


interface WindowConfig {
    id: string
    title: string
    x?: number
    y?: number
    width?: number
}

abstract class Window<T> implements WindowConfig {
    static draggingWindowObject: Window<never>
    static mouseStartingX: number
    static mouseStartingY: number
    static draggingWindow: HTMLElement | null

    windowElement: HTMLDivElement
    headerElement: HTMLDivElement
    contentElement: HTMLDivElement

    id: string
    title: string

    x: number
    private _x!: number

    y: number
    private _y!: number

    width: number

    constructor(config: WindowConfig) {
        this.id = config.id
        this.title = config.title

        this.bindWindowPosition()

        const newWindow = createWindowElement(this)
        this.windowElement = newWindow.windowElement
        this.headerElement = newWindow.headerElement
        this.contentElement = newWindow.contentElement

        this.x = config.x || getWindowData(this.id)?.x || 100
        this.y = config.y || getWindowData(this.id)?.y || 100

        this.width = config.width || getWindowData(this.id)?.width || 300
    }

    bindWindowPosition() {
        Object.defineProperty(this, 'x', {
            get() { return this._x },
            set(newValue) {
                var boundedValue = Math.max(newValue, 0)
                boundedValue = Math.min(boundedValue, window.innerWidth - this.windowElement.offsetWidth)

                this.windowElement.style.left = boundedValue + 'px'
                this._x = boundedValue
            },
            enumerable: true
        })

        Object.defineProperty(this, 'y', {
            get() { return this._y },
            set(newValue) {
                var boundedValue = Math.max(newValue, 0)
                boundedValue = Math.min(boundedValue, window.innerHeight - this.windowElement.offsetHeight)

                this.windowElement.style.top = boundedValue + 'px'
                this._y = boundedValue
            },
            enumerable: true
        })
    }

    startMoving(e: MouseEvent) {
        Window.mouseStartingX = e.offsetX
        Window.mouseStartingY = e.offsetY
        Window.draggingWindowObject = this

        const handler = (e: MouseEvent) => this.move(e)

        document.addEventListener("mousemove", handler, false)

        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", handler, false)
            Window.draggingWindowObject.savePosition()
        }, false)
    }



    move(e: MouseEvent) {
        this.x = e.pageX - Window.mouseStartingX
        this.y = e.pageY - Window.mouseStartingY
    }

    savePosition() {
        setWindowData(this)
    }

    abstract updateContent(content: T): void
}

type CreateWindowResult = {
    windowElement: HTMLDivElement
    headerElement: HTMLDivElement
    contentElement: HTMLDivElement
}
function createWindowElement(window: Window<never>): CreateWindowResult {
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

    headerDiv.addEventListener("mousedown", (e) => window.startMoving(e), false)

    return { windowElement: windowDiv, headerElement: headerDiv, contentElement: contentDiv }
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

export class TaskManagerWindow extends Window<Types.TaskManager> {

    updateContent(content: Types.TaskManager): void {
        this.contentElement.innerHTML = ''
        const taskManagerTable = document.createElement('table')
        this.contentElement.appendChild(taskManagerTable)

        taskManagerTable.querySelectorAll('tr').forEach(c => c.remove())
        taskManagerTable.innerHTML = '<thead><td>PID</td><td>progress</td></thead>'

        content.processes.forEach(p => {
            const processRow = document.createElement('tr')
            const pidElement = processRow.appendChild(document.createElement('td'))
            const progressElement = processRow.appendChild(document.createElement('td'))

            pidElement.textContent = p.pid

            var workDone = (<Types.WorkerProcess>p).workDone
            var totalWork = (<Types.WorkerProcess>p).totalWork

            setInterval(() => {
                workDone += 1000 / 30
                console.log(`TaskManagerWindow -> updateContent -> workDone`, workDone)
                progressElement.textContent = `${Math.round(workDone / totalWork * 100)}%`

            }, 1000 / 30)

            taskManagerTable.appendChild(processRow)
        })
    }
}

