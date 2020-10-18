import { Element } from "../lib/html-helper.js"

export enum IconType {
    brokenLink = 'fa-unlink',
    folder = 'fa-folder',
    link = 'fa-link',
    list = 'fa-list',
    signIn = 'fa-sign-in',
    network = 'fa-connectdevelop',
    server = 'fa-server',
    circleNotch = 'fa-circle-o-notch',
    tasks = 'fa-tasks',
    toggleLeft = 'fa-caret-square-o-left',
    toggleRight = 'fa-caret-square-o-right',
    userSecret = 'icon-user-secret',
}

export class Icon extends Element {
    element!: HTMLElement

    constructor(code: IconType, options?: { parent?: HTMLElement }) {
        super(options)
        this.addClass('fa')
        this.addClass(code)
    }

    createElement() { this.element = document.createElement('i') }
}
