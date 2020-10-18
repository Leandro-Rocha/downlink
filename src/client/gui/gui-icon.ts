import { Element } from "../lib/html-helper.js"

export enum IconType {
    brokenLink = 'icon-unlink',
    folder = 'icon-folder',
    link = 'icon-link',
    list = 'icon-list',
    login = 'icon-login',
    network = 'icon-network',
    server = 'icon-server',
    spin1 = 'icon-spin1',
    spin2 = 'icon-spin2',
    tasks = 'icon-tasks',
    userSecret = 'icon-user-secret',
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