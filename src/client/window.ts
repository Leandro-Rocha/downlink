import { GameEntity } from '../common/types.js'
import './client-interfaces.js'
import { GuiElement } from './gui/gui-base.js'

// if (!localStorage.getItem('windowPositions')) {
//     localStorage.setItem('windowPositions', JSON.stringify('{}'))

// }

function setWindowData(window: Window<any>) {
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


export interface WindowConfig {
    id: string
    title: string
    x?: number
    y?: number
    width?: number
}

export abstract class Window<T extends GameEntity> extends GuiElement<T> implements WindowConfig {
    static draggingWindowObject: Window<any>
    static mouseStartingX: number
    static mouseStartingY: number
    static draggingWindow: HTMLElement | null

    element: HTMLDivElement
    headerElement: HTMLDivElement
    contentElement: HTMLDivElement

    id: string
    title: string

    x: number
    private _x!: number

    y: number
    private _y!: number

    width: number

    constructor(config: Partial<Window<T>>) {
        super()

        this.id = config.id!
        this.title = config.title!

        this.bindWindowPosition()

        const newWindow = createWindowElement(this)
        this.element = newWindow.windowElement
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
                boundedValue = Math.min(boundedValue, window.innerWidth - this.element.offsetWidth)

                this.element.style.left = boundedValue + 'px'
                this._x = boundedValue
            },
            enumerable: true
        })

        Object.defineProperty(this, 'y', {
            get() { return this._y },
            set(newValue) {
                var boundedValue = Math.max(newValue, 0)
                boundedValue = Math.min(boundedValue, window.innerHeight - this.element.offsetHeight)

                this.element.style.top = boundedValue + 'px'
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
function createWindowElement<T extends GameEntity>(window: Window<T>): CreateWindowResult {
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
