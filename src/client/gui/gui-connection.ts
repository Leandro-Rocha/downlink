import { ConnectionStatus } from "../../common/constants.js"
import { GameStateType } from "../../common/types.js"
import { connectToGateway, disconnect } from "../client.js"
import { StateAware } from "./gui-game-state.js"
import { Icon, IconType } from "./gui-icon.js"
import { guiContainer, guiHeader } from "./gui.js"



export class ConnectionWindow implements StateAware<GameStateType> {
    restoredDiv!: HTMLDivElement
    localHostname!: HTMLSpanElement
    remoteHostname!: HTMLSpanElement
    remoteIpInput!: HTMLInputElement
    connectButton!: HTMLButtonElement
    disconnectButton!: HTMLButtonElement
    minimizedDiv!: HTMLDivElement
    linkIcon!: HTMLElement

    constructor() {
        this.createRestoredWindow()
        guiContainer.appendChild(this.restoredDiv)

        this.createMinimizedWindow()
        guiHeader.element.appendChild(this.minimizedDiv)

    }

    toggleWindow() {
        this.restoredDiv.classList.toggle('hidden')
    }

    private createMinimizedWindow() {
        this.minimizedDiv = document.createElement('div')
        this.minimizedDiv.classList.add('connectionDiv')
        this.minimizedDiv.classList.add('minimized')
        this.minimizedDiv.addEventListener('click', () => this.toggleWindow())

        const localIcon = new Icon(IconType.server, { parent: this.minimizedDiv })
        localIcon.addClass('local')

        this.linkIcon = new Icon(IconType.link, { parent: this.minimizedDiv }).element
        this.linkIcon.classList.add('link')
        this.minimizedDiv.appendChild(this.linkIcon)

        const remoteIcon = new Icon(IconType.server, { parent: this.minimizedDiv }).element
        remoteIcon.classList.add('remote')
    }

    private createRestoredWindow() {
        this.restoredDiv = document.createElement('div')
        this.restoredDiv.classList.add('connectionDiv')
        this.restoredDiv.classList.add('restored')
        this.restoredDiv.classList.add('hidden')

        const localGatewayDiv = document.createElement('div')
        localGatewayDiv.classList.add('gatewayDiv')
        localGatewayDiv.classList.add('local')
        this.restoredDiv.appendChild(localGatewayDiv)

        const localIcon = new Icon(IconType.server).element
        localIcon.classList.add('local')
        localGatewayDiv.appendChild(localIcon)

        this.localHostname = document.createElement('span')
        this.localHostname.classList.add('hostname')
        localGatewayDiv.appendChild(this.localHostname)


        const remoteGatewayDiv = document.createElement('div')
        remoteGatewayDiv.classList.add('gatewayDiv')
        remoteGatewayDiv.classList.add('remote')
        this.restoredDiv.appendChild(remoteGatewayDiv)

        const remoteIcon = new Icon(IconType.server).element
        remoteIcon.classList.add('remote')
        remoteGatewayDiv.appendChild(remoteIcon)

        this.remoteHostname = document.createElement('span')
        this.remoteHostname.classList.add('hostname')
        remoteGatewayDiv.appendChild(this.remoteHostname)

        this.remoteIpInput = document.createElement('input')
        this.remoteIpInput.classList.add('ipInput')
        remoteGatewayDiv.appendChild(this.remoteIpInput)

        this.connectButton = document.createElement('button')
        this.connectButton.classList.add('connect')
        this.connectButton.innerText = 'Connect'
        this.connectButton.addEventListener('click', () => connectToGateway(this.remoteIpInput.value))


        this.disconnectButton = document.createElement('button')
        this.disconnectButton.classList.add('disconnect')
        this.disconnectButton.innerText = 'Disconnect'
        this.disconnectButton.addEventListener('click', () => disconnect())
        this.restoredDiv.appendChild(this.disconnectButton)

        remoteGatewayDiv.appendChild(this.connectButton)
    }

    updateState(state: GameStateType): void {
        this.localHostname.textContent = state.localGateway.hostname!
        this.remoteHostname.textContent = state.remoteGateway?.hostname || ''

        const connection = state.localGateway.outboundConnection

        if (!connection || connection.status === ConnectionStatus.DISCONNECTED) {
            this.remoteIpInput.classList.remove('hidden')
            this.connectButton.classList.remove('hidden')
            this.disconnectButton.classList.add('hidden')

            this.linkIcon.classList.remove(IconType.link)
            this.linkIcon.classList.add(IconType.brokenLink)
        }

        if (connection && connection.status === ConnectionStatus.CONNECTED) {
            this.remoteIpInput.classList.add('hidden')
            this.connectButton.classList.add('hidden')
            this.disconnectButton.classList.remove('hidden')

            this.linkIcon.classList.add(IconType.link)
            this.linkIcon.classList.remove(IconType.brokenLink)

            this.remoteIpInput.value = connection.ip
        }
    }
}
