import { IconType } from "../gui/gui-icon.js"
import { createCSSRule } from "../internals.js"
import { Mouse } from "../mouse.js"
import { addCssRule } from "./css-helper.js"
import { Div } from "./html-helper.js"

addCssRule('.window',
    {
        display: 'flex',
        'flex-direction': 'column',
        'border': '1px white solid',
        'position': 'absolute',
        'background-color': 'white',
        'box-shadow': '0px 10px 20px -10px black',
    }
)

addCssRule('.window.restored',
    {
        transition: `opacity cubic-bezier(0.075, 0.82, 0.165, 1),
        left 0.2s cubic-bezier(0.075, 0.82, 0.165, 1),
        width 0.2s cubic-bezier(0.075, 0.82, 0.165, 1),
        top 0.2s cubic-bezier(0.19, 1, 0.22, 1) 0.2s,
        height 0.1s cubic-bezier(0.075, 0.82, 0.165, 1) 0.2s`
    }
)


export class Window {
    windowDiv!: Div
    content!: Div

    id!: string
}


export abstract class HeadedWindow extends Window {
    header!: Div
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


export function createWindowElements(window: Window, parent: HTMLElement) {

    window.windowDiv = new Div({ parent })
    window.windowDiv
        .id(`window-${window.id}`)
        .addClass('window')


    window.content = window.windowDiv.div
    window.content.addClass('content')

}


export function addWindowHeaderElement(headedWindow: HeadedWindow, title: string, icon?: IconType) {

    headedWindow.header = new Div()
    headedWindow.windowDiv.element.insertBefore(headedWindow.header.element, headedWindow.content.element)
    headedWindow.header.addClass('header')

    if (icon)
        headedWindow.header.icon.code(icon).addClass('header-icon')

    headedWindow.header.span.text(title)
}


export function addDraggableElement(draggableWindow: DraggableWindow) {

    draggableWindow.positionCSS = createCSSRule(`.${draggableWindow.id}-position`)
    draggableWindow.windowDiv.addClass(`${draggableWindow.id}-position`)

    // Disable transitions while creating the window
    draggableWindow.windowDiv.element.style.transition = 'none'
    setTimeout(() => draggableWindow.windowDiv.element.style.transition = '', 1); //TODO: Promise
}



export function addHeader(window: Window, title: string, icon?: IconType) {
    Object.assign(window, HeadedWindow)
    const headedWindow = window as HeadedWindow
    addWindowHeaderElement(headedWindow, title, icon)
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
            boundedValue = Math.min(boundedValue, window.innerWidth - myWindow.windowDiv.element.offsetWidth)

            this.positionCSS.style.left = boundedValue + 'px'
            this._x = boundedValue
        },
        enumerable: true
    })

    Object.defineProperty(myWindow, 'y', {
        get() { return this._y },
        set(newValue) {
            var boundedValue = Math.max(newValue, 35)
            boundedValue = Math.min(boundedValue, window.innerHeight - myWindow.windowDiv.element.offsetHeight)


            this.positionCSS.style.top = boundedValue + 'px'
            this._y = boundedValue
        },
        enumerable: true
    })

    Object.defineProperty(myWindow, 'zIndex', {
        get() { return this._zIndex },
        set(newValue) {
            this._zIndex = newValue
            myWindow.windowDiv.element.style.zIndex = newValue
        },
        enumerable: true
    })


}




