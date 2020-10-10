

export class GuiHeader {
    element: HTMLDivElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('guiHeader')
        document.body.appendChild(this.element)
    }
}