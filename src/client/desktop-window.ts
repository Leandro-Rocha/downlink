import { applyMixins } from "../common/utils.js"
import { Desktop } from "./gui/desktop.js"
import { Domain } from "./gui/domain.js"
import { guiContainer } from "./gui/gui.js"
import { Window, HeadedWindow, DraggableWindow, addHeader, createWindowElements, makeDraggable, } from "./lib/window-core.js"


export interface DesktopWindow extends Window, HeadedWindow, DraggableWindow { }
export class DesktopWindow {
    domain: Domain
    state: WindowState

    minimizedElement!: HTMLElement
    windowControls!: WindowControls

    constructor(config: DesktopWindowConfig, extraCssClasses: string[] = []) {
        Desktop.windowList.push(this)

        this.id = config.id
        this.domain = config.domain
        this.title = config.title

        createWindowElements(this, guiContainer)
        this.element.classList.add(...extraCssClasses)

        addHeader(this, this.title)
        addWindowControls(this)
        createMinimizedElement(this)

        makeDraggable(this, this.headerElement, {
            callbacks: {
                start: () => this.element.style.transition = 'none',
                end: () => {
                    this.element.style.transition = ''
                    this.savePosition()
                }
            },
            skipElements: [this.windowControls.minimize]
        })
        this.element.addEventListener('mousedown', () => Desktop.bringToFront(this))


        const domainClass = this.domain.cssClass
        this.element.classList.add(domainClass)
        this.headerElement.classList.add(domainClass)
        this.contentElement.classList.add(domainClass)

        // Position
        const storedPosition = Desktop.getWindowData(this.id)
        this.x = config.x || storedPosition?.x || (window.innerWidth - this.element.offsetWidth) / 2
        this.y = config.y || storedPosition?.y || (window.innerHeight - this.element.offsetHeight) / 2
        this.zIndex = config.zIndex || storedPosition?.zIndex || Desktop.windowList.findIndex(w => w === this) + 1

        this.state = config.state || storedPosition?.state || WindowState.MINIMIZED

        if (this.state === WindowState.MINIMIZED) this.minimize()
        else this.restore()
    }

    minimize() {
        this.state = WindowState.MINIMIZED;
        this.savePosition();

        (<any>this.positionCSS).style.top = this.minimizedElement.offsetTop + 40 + 'px' // HACK =[

        this.element.classList.remove('restored')
        this.element.classList.add('minimized')

        this.contentElement.classList.remove('restored')
        this.contentElement.classList.add('minimized')
    }

    restore() {
        this.state = WindowState.RESTORED;
        (<any>this.positionCSS).style.top = Desktop.getWindowData(this.id)?.y || 0 + 'px' // HACK =[
        this.savePosition()

        this.element.classList.remove('minimized')
        this.element.classList.add('restored')

        this.contentElement.classList.remove('minimized')
        this.contentElement.classList.add('restored')
    }

    hide() {
        this.element.classList.add('hidden')
        this.minimizedElement.classList.add('hidden')
    }

    show() {
        this.element.classList.remove('hidden')
        this.minimizedElement.classList.remove('hidden')
    }

    savePosition() {
        Desktop.saveWindowData(
            {
                id: this.id,
                title: this.title,
                domain: this.domain,
                x: this.x,
                y: this.y,
                zIndex: this.zIndex,
                state: this.state
            }
        )
    }
}
applyMixins(DesktopWindow, [Window, HeadedWindow, DraggableWindow])


enum WindowState {
    RESTORED = 'RESTORED',
    MINIMIZED = 'MINIMIZED',
}

export interface DesktopWindowConfig {
    id: string
    title: string
    domain: Domain
    x?: number
    y?: number
    zIndex?: number
    state?: WindowState
}

function createMinimizedElement(window: DesktopWindow) {
    const targetMenu = window.domain.navigation.menuElement

    const minimizedElement = document.createElement('li')
    window.minimizedElement = minimizedElement
    targetMenu.appendChild(minimizedElement)

    minimizedElement.innerText = window.title
    minimizedElement.addEventListener('click', () => {
        if (window.state === WindowState.MINIMIZED) {
            window.restore()
        }
        Desktop.bringToFront(window)
    })
}

interface WindowControls {
    controls: HTMLDivElement
    minimize: HTMLDivElement
}

function addWindowControls(window: DesktopWindow) {
    const windowControlDiv = document.createElement('div')
    window.headerElement.appendChild(windowControlDiv)
    windowControlDiv.classList.add('window-control')

    const minimizeDiv = document.createElement('div')
    windowControlDiv.appendChild(minimizeDiv)
    minimizeDiv.classList.add('minimize-control')
    minimizeDiv.addEventListener('click', window.minimize.bind(window))

    window.windowControls = { controls: windowControlDiv, minimize: minimizeDiv }
}