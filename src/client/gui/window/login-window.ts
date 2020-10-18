import { ConnectionStatus } from '../../../common/constants.js'
import { GameStateType } from '../../../common/types.js'
import { login } from '../../client.js'
import { DesktopWindow, DesktopWindowConfig } from '../../desktop-window.js'
import { Input } from '../../lib/html-helper.js'
import { StateAware } from '../gui-game-state.js'
import { Icon, IconType } from '../gui-icon.js'


export class LoginWindow extends DesktopWindow implements StateAware<GameStateType> {

    userInput: Input
    passInput: Input
    loginButton: HTMLElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-login'])

        const loginTable = this.content.table.addClass('login-table')

        const userRow = loginTable.body.tr
        userRow.td.text('User')
        this.userInput = userRow.td.input

        const passRow = loginTable.body.tr
        passRow.td.text('Password')
        this.passInput = passRow.td.input

        this.loginButton = new Icon(IconType.signIn).element
        this.loginButton.classList.add('login-button')
        this.loginButton.addEventListener('click', () => login(this.userInput.element.value, this.passInput.element.value))
        this.content.element.appendChild(this.loginButton)

        this.userInput.element.addEventListener("keydown", (event) => this.enterHandler(event))
        this.passInput.element.addEventListener("keydown", (event) => this.enterHandler(event))

    }

    getIcon(): IconType { return IconType.userSecret }

    enterHandler(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.loginButton.click()
        }
    }

    updateState(state?: GameStateType): void {

        if (state?.remoteGateway?.users) {
            const entry = state.hackedDB.entries.find(e => e.ip === state.remoteGateway?.ip)?.user

            const password = entry!.password
            const userName = entry!.userName
            this.userInput.value(userName)
            this.passInput.value(password)
        }

        if (state?.localGateway.outboundConnection
            && state.localGateway.outboundConnection.status === ConnectionStatus.CONNECTED)
            this.show()

        else this.hide()
    }
}