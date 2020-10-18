import { applyMixins } from "../common/utils.js"
import { Desktop } from "./gui/desktop.js"
import { Domain, DomainType } from "./gui/domain.js"
import { Icon, IconType } from "./gui/gui-icon.js"
import { guiContainer } from "./gui/gui.js"
import { Span } from "./lib/html-helper.js"
import { Window, HeadedWindow, DraggableWindow, addHeader, createWindowElements, makeDraggable, } from "./lib/window-core.js"


export interface DesktopWindow extends Window, HeadedWindow, DraggableWindow { }
export abstract class DesktopWindow {
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
        this.windowDiv.addClass(...extraCssClasses)

        addHeader(this, this.title)
        addWindowControls(this)
        createMinimizedElement(this)

        makeDraggable(this, this.header.element, {
            callbacks: {
                start: () => this.windowDiv.element.style.transition = 'none',
                end: () => {
                    this.windowDiv.element.style.transition = ''
                    this.savePosition()
                }
            },
            skipElements: [this.windowControls.minimize]
        })
        this.windowDiv.element.addEventListener('mousedown', () => Desktop.bringToFront(this))


        const domainClass = this.domain.cssClass
        this.windowDiv.addClass(domainClass)
        this.header.addClass(domainClass)
        this.content.addClass(domainClass)

        // Position
        const storedPosition = Desktop.getWindowData(this.id)
        this.x = config.x || storedPosition?.x || (window.innerWidth - this.windowDiv.element.offsetWidth) / 2
        this.y = config.y || storedPosition?.y || (window.innerHeight - this.windowDiv.element.offsetHeight) / 2
        this.zIndex = config.zIndex || storedPosition?.zIndex || document.querySelectorAll('.window').length

        this.state = config.state || storedPosition?.state || WindowState.MINIMIZED

        if (this.state === WindowState.MINIMIZED) this.minimize()
        else this.restore()
    }

    abstract getIcon(): IconType

    minimize() {
        this.state = WindowState.MINIMIZED;
        this.savePosition();

        (<any>this.positionCSS).style.top = this.minimizedElement.offsetTop + 40 + 'px' // HACK =[

        this.windowDiv.removeClass('restored')
        this.windowDiv.addClass('minimized')

        this.content.removeClass('restored')
        this.content.addClass('minimized')
    }

    restore() {
        this.state = WindowState.RESTORED;
        (<any>this.positionCSS).style.top = (Desktop.getWindowData(this.id)?.y || 0) + 'px' // HACK =[
        this.savePosition()

        this.windowDiv.removeClass('minimized')
        this.windowDiv.addClass('restored')

        this.content.removeClass('minimized')
        this.content.addClass('restored')
    }

    hide() {
        this.windowDiv.addClass('hidden')
        this.minimizedElement.classList.add('hidden')
    }

    show() {
        this.windowDiv.removeClass('hidden')
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

    const titleText = new Span().addClass('menu-title').element
    titleText.innerText = window.title
    minimizedElement.appendChild(titleText)

    const icon = new Icon(window.getIcon())

    if (window.domain.type === DomainType.LOCAL)
        titleText.after(icon.element)
    else
        titleText.before(icon.element)


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

    const windowControlDiv = window.header.div
    windowControlDiv.addClass('window-control')

    const minimizeDiv = windowControlDiv.div
    minimizeDiv.addClass('minimize-control')
    minimizeDiv.element.addEventListener('click', window.minimize.bind(window))

    window.windowControls = { controls: windowControlDiv.element, minimize: minimizeDiv.element }
}