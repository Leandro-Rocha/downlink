import { resolve } from 'path'
import { GameEntity } from '../common/types.js'
import './client-interfaces.js'
import { createCSSRule, GuiElement } from './gui/gui-base.js'

// if (!localStorage.getItem('windowPositions')) {
//     localStorage.setItem('windowPositions', JSON.stringify('{}'))

// }

function setWindowData(window: WindowConfig) {
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


enum WindowState {
    RESTORED = 'RESTORED',
    MINIMIZED = 'MINIMIZED',
}
export enum WindowDomain {
    LOCAL = 'LOCAL',
    REMOTE = 'REMOTE',
}
export interface WindowConfig {
    id: string
    title: string
    domain: WindowDomain
    x?: number
    y?: number
    width?: number
    state?: WindowState
}

export abstract class Window<T extends GameEntity> extends GuiElement<T> implements WindowConfig {

    static draggingWindowObject: Window<any>
    static mouseStartingX: number
    static mouseStartingY: number
    static draggingWindow: HTMLElement | null

    positionCSS: CSSRule
    element: HTMLDivElement
    headerElement: HTMLDivElement
    contentElement: HTMLDivElement

    minimizedElement: HTMLLIElement

    id: string
    title: string
    domain: WindowDomain

    x: number
    private _x!: number
    restoredX!: number

    y: number
    private _y!: number
    restoredY!: number

    width: number

    state: WindowState

    constructor(config: Partial<Window<T>>) {
        super()

        this.id = config.id!
        this.title = config.title!
        this.domain = config.domain!

        this.bindWindowPosition()

        const newWindow = createWindowElement(this)
        this.element = newWindow.windowElement
        this.headerElement = newWindow.headerElement
        this.contentElement = newWindow.contentElement

        this.minimizedElement = createMinimizedElement(this)

        this.positionCSS = createCSSRule(`.${this.id}-position`)
        this.element.classList.add(`${this.id}-position`)


        // Disable transitions while creating the window
        this.element.style.transition = 'none'
        setTimeout(() => this.element.style.transition = '', 1);

        const storedPosition = getWindowData(this.id)
        this.x = config.x || storedPosition?.x || 100
        this.y = config.y || storedPosition?.y || 100
        this.width = config.width || storedPosition?.width || 300
        this.state = config.state || storedPosition?.state || WindowState.MINIMIZED

        if (this.state === WindowState.MINIMIZED) this.minimize()
        else this.restore()
    }

    minimize() {
        this.state = WindowState.MINIMIZED
        this.savePosition()

        const hack = (this.positionCSS as any).style.top = this.minimizedElement.offsetTop + 25 + 'px' // HACK =[

        this.element.classList.remove('restoreTransitions')
        this.element.classList.add('minimizeTransitions')
        this.element.classList.add('minimized')
    }

    restore() {
        this.state = WindowState.RESTORED
        const hack = (this.positionCSS as any).style.top = getWindowData(this.id).y + 'px' // HACK =[
        this.savePosition()

        this.element.classList.remove('minimizeTransitions')
        this.element.classList.add('restoreTransitions')
        this.element.classList.remove('minimized')
    }

    toggle() {
        if (this.state === WindowState.MINIMIZED) {
            this.restore()
        }
        else {
            this.minimize()
        }
    }

    bringToFront() {
        const allWindows = (<NodeListOf<HTMLDivElement>>document.querySelectorAll('.window'))

        allWindows.forEach((e: HTMLDivElement) => {
            if (e.style.zIndex > this.element.style.zIndex) {
                var zIndex = Number(e.style.zIndex)
                e.style.zIndex = (--zIndex).toString()
            }
        })

        this.element.style.zIndex = document.querySelectorAll('.window').length.toString()
    }

    bindWindowPosition() {
        Object.defineProperty(this, 'x', {
            get() { return this._x },
            set(newValue) {
                var boundedValue = Math.max(newValue, 0)
                boundedValue = Math.min(boundedValue, window.innerWidth - this.element.offsetWidth)

                this.positionCSS.style.left = boundedValue + 'px'
                this._x = boundedValue
            },
            enumerable: true
        })

        Object.defineProperty(this, 'y', {
            get() { return this._y },
            set(newValue) {
                var boundedValue = Math.max(newValue, 0)
                boundedValue = Math.min(boundedValue, window.innerHeight - this.element.offsetHeight)


                this.positionCSS.style.top = boundedValue + 'px'
                this._y = boundedValue
            },
            enumerable: true
        })
    }

    startMoving(e: MouseEvent) {
        e.preventDefault()
        this.element.style.transition = 'none'

        Window.mouseStartingX = e.offsetX
        Window.mouseStartingY = e.offsetY
        Window.draggingWindowObject = this

        const handler = (e: MouseEvent) => this.move(e)

        document.addEventListener("mousemove", handler, false)

        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", handler, false)
            Window.draggingWindowObject.savePosition()
            Window.draggingWindowObject.element.style.transition = ''
        }, false)
    }



    move(e: MouseEvent) {
        this.x = e.pageX - Window.mouseStartingX
        this.y = e.pageY - Window.mouseStartingY
    }

    savePosition() {
        setWindowData(
            {
                id: this.id,
                title: this.title,
                domain: this.domain,
                x: this.x,
                y: this.y,
                width: this.width,
                state: this.state
            }
        )
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
    contentDiv.classList.add('window-content')
    windowDiv.appendChild(contentDiv)
    
    const domainClass = getTargetDomainClass(window.domain)
    windowDiv.classList.add(domainClass)
    headerDiv.classList.add(domainClass)
    contentDiv.classList.add(domainClass)
    

    const headerTitleDiv = document.createElement('span')
    headerTitleDiv.textContent = window.title
    headerDiv.appendChild(headerTitleDiv)

    const windowControlDiv = document.createElement('div')
    headerDiv.appendChild(windowControlDiv)

    const minimizeDiv = document.createElement('div')
    windowControlDiv.appendChild(minimizeDiv)


    //  Brings clicked window to top level
    windowDiv.style.zIndex = document.querySelectorAll('.window').length.toString()
    windowDiv.addEventListener("mousedown", window.bringToFront.bind(window))

    headerDiv.addEventListener("mousedown", (e) => window.startMoving(e), false)

    return { windowElement: windowDiv, headerElement: headerDiv, contentElement: contentDiv }
}

function createMinimizedElement(window: Window<any>) {
    const targetMenu = getTargetMenu(window.domain)
    const minimizedElement = document.createElement('li')
    minimizedElement.innerText = window.title
    minimizedElement.addEventListener('click', () => {
        if (window.state === WindowState.MINIMIZED) {
            window.restore()
        }

        window.bringToFront()
    })

    targetMenu.appendChild(minimizedElement)

    return minimizedElement
}

function getTargetMenu(domain: WindowDomain) {
    if (domain === WindowDomain.LOCAL)
        return document.querySelector('#localMenu')!

    return document.querySelector('#remoteMenu')!
}

function getTargetDomainClass(domain: WindowDomain) {
    if (domain === WindowDomain.LOCAL) return 'local'
    return 'remote'
}