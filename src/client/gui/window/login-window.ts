import { login } from '../../client.js'
import { DesktopWindow, DesktopWindowConfig } from '../../desktop-window.js'
import { createIcon, IconType } from '../gui-icon.js'


export class LoginWindow extends DesktopWindow {
    loginButton: HTMLElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-login'])

        const loginTable = this.content.table.addClass('login-table')

        const userRow = loginTable.body.tr
        userRow.td.text('User')
        const userInput = userRow.td.input

        const passRow = loginTable.body.tr
        passRow.td.text('Password')
        const passInput = passRow.td.input

        this.loginButton = createIcon(IconType.login)
        this.loginButton.classList.add('login-button')
        this.loginButton.addEventListener('click', () => login(userInput.element.value, passInput.element.value))
        this.content.element.appendChild(this.loginButton)

        userInput.element.addEventListener("keydown", (event) => this.enterHandler(event))
        passInput.element.addEventListener("keydown", (event) => this.enterHandler(event))

    }

    enterHandler(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.loginButton.click()
        }
    }
}