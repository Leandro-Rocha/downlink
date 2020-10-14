import { createCSSRule } from "../internals.js"
import { Mouse } from "../mouse.js"

export class Window {
    element!: HTMLDivElement
    contentElement!: HTMLDivElement

    id!: string
    // this.state = config.state || storedPosition?.state || WindowState.MINIMIZED
}


export abstract class HeadedWindow extends Window {
    headerElement!: HTMLDivElement
    title!: string
}

export abstract class DraggableWindow extends Window {

    positionCSS!: CSSRule

    private _x!: number
    private _y!: number
    private _zIndex!: number

    x!: number
    y!: number
    zIndex!: number

    position() {
        return { x: this._x, y: this._y }
    }

    move(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

// export class ResizableWindow extends Window {
//     width!: number
//     height!: number
// }


export function createWindowElements(window: Window, parent: HTMLElement) {
    const windowDiv = document.createElement('div')
    parent.appendChild(windowDiv)
    window.element = windowDiv
    windowDiv.id = `window-${window.id}`
    windowDiv.classList.add('window')

    const contentDiv = document.createElement('div')
    window.contentElement = contentDiv
    contentDiv.classList.add('content')
    windowDiv.appendChild(contentDiv)

}


export function addWindowHeaderElement(headedWindow: HeadedWindow, title: string) {
    const headerDiv = document.createElement('div')
    headedWindow.element.insertBefore(headerDiv, headedWindow.contentElement)
    headedWindow.headerElement = headerDiv
    headerDiv.classList.add('header')

    const headerTitleDiv = document.createElement('span')
    headerDiv.appendChild(headerTitleDiv)
    headerTitleDiv.textContent = title
}


export function addDraggableElement(draggableWindow: DraggableWindow) {

    draggableWindow.positionCSS = createCSSRule(`.${draggableWindow.id}-position`)
    draggableWindow.element.classList.add(`${draggableWindow.id}-position`)

    // Disable transitions while creating the window
    draggableWindow.element.style.transition = 'none'
    setTimeout(() => draggableWindow.element.style.transition = '', 1); //TODO: Promise
}



export function addHeader(window: Window, title: string) {
    Object.assign(window, HeadedWindow)
    const headedWindow = window as HeadedWindow
    addWindowHeaderElement(headedWindow, title)
    return headedWindow
}

export function makeDraggable(myWindow: Window, draggableElement: HTMLElement, options?: { skipElements?: HTMLElement[], callbacks?: { start?: Function, end?: Function } }) {
    Object.assign(myWindow, DraggableWindow)
    const draggableWindow = myWindow as DraggableWindow
    addDraggableElement(draggableWindow)
    bindPositionAccessors(draggableWindow)

    draggableElement.addEventListener('mousedown', (e) => {
        e.preventDefault()

        if (options?.skipElements?.some(elem => elem === e.target)) return

        if (options?.callbacks?.start) options.callbacks.start()

        const moveHandler = (e: MouseEvent) => {
            const x = e.pageX - Mouse.startingX
            const y = e.pageY - Mouse.startingY
            draggableWindow.move(x, y)
        }

        Mouse.startDragging(e, moveHandler, options?.callbacks?.end)
    })

    return draggableWindow
}

function bindDimensionAccessors(myWindow: DraggableWindow) {
    Object.defineProperty(myWindow, 'width', {
        get() { return this._width },
        set(newValue) {
            this.positionCSS.style.width = newValue + 'px'
            this._width = newValue
        },
        enumerable: true
    })
}

function bindPositionAccessors(myWindow: DraggableWindow) {

    Object.defineProperty(myWindow, 'x', {
        get() { return this._x },
        set(newValue) {
            var boundedValue = Math.max(newValue, 0)
            boundedValue = Math.min(boundedValue, window.innerWidth - this.element.offsetWidth)

            this.positionCSS.style.left = boundedValue + 'px'
            this._x = boundedValue
        },
        enumerable: true
    })

    Object.defineProperty(myWindow, 'y', {
        get() { return this._y },
        set(newValue) {
            var boundedValue = Math.max(newValue, 35)
            boundedValue = Math.min(boundedValue, window.innerHeight - this.element.offsetHeight)


            this.positionCSS.style.top = boundedValue + 'px'
            this._y = boundedValue
        },
        enumerable: true
    })

    Object.defineProperty(myWindow, 'zIndex', {
        get() { return this._zIndex },
        set(newValue) {
            this._zIndex = newValue
            this.element.style.zIndex = newValue
        },
        enumerable: true
    })


}




