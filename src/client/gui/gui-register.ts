import { registerUser } from "../client.js"
import { createIcon, IconType } from "./gui-icon.js"



export class GuiRegister {
    element: HTMLDivElement
    userNameInput: HTMLInputElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('fullScreen')
        this.element.classList.add('guiRegister')
        document.body.appendChild(this.element)

        const label = document.createElement('span')
        label.textContent = 'Register User'
        this.element.appendChild(label)

        this.userNameInput = document.createElement('input')
        this.userNameInput.classList.add('ipInput')
        this.element.appendChild(this.userNameInput)

        const loginButton = createIcon(IconType.login)
        loginButton.classList.add('loginButton')
        loginButton.addEventListener('click', () => registerUser(this.userNameInput.value))
        this.element.appendChild(loginButton)

        this.userNameInput.addEventListener("keydown", function (event) {
            if (event.key === 'Enter') {
                loginButton.click();
            }
        })


    }
}