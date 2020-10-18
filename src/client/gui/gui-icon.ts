import { Element } from "../lib/html-helper.js"

export enum IconType {
    server = 'icon-server',
    link = 'icon-link',
    brokenLink = 'icon-unlink',
    login = 'icon-login',
    spin1 = 'icon-spin1',
    spin2 = 'icon-spin2',
}

export function createIcon(code: IconType): HTMLElement {
    const icon = document.createElement('i')
    icon.classList.add(code)
    return icon
}

export class Icon extends Element {
    element!: HTMLElement

    constructor(code: IconType) {
        super()
        this.addClass(code)
    }

    createElement() { this.element = document.createElement('i') }
}