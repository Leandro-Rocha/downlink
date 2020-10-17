import { registerUser } from "../client.js"
import { Div, Input } from "../lib/html-helper.js"
import { createIcon, IconType } from "./gui-icon.js"



export class GuiRegister {
    screen: Div
    userNameInput: Input

    constructor() {

        this.screen = new Div({ parent: document.body })
        this.screen.addClass('fullScreen')
        this.screen.addClass('guiRegister')
        this.screen.addClass('hidden')

        this.screen.span.text('Register User')

        this.userNameInput = this.screen.input
        this.userNameInput.addClass('ipInput')

        const loginButton = createIcon(IconType.login)
        loginButton.classList.add('loginButton')
        loginButton.addEventListener('click', () => registerUser(this.userNameInput.element.value))
        this.screen.element.appendChild(loginButton)

        this.userNameInput.element.addEventListener("keydown", function (event) {
            if (event.key === 'Enter') {
                loginButton.click();
            }
        })


    }
}