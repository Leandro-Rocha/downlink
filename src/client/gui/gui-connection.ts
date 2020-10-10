import { ConnectionStatus } from "../../common/constants.js"
import { GameState } from "../../common/types.js"
import { connectToGateway, disconnect } from "../client.js"


export class ConnectionWindow {
    restoredDiv: HTMLDivElement
    localHostname: HTMLSpanElement
    remoteHostname: HTMLSpanElement
    remoteIpInput: HTMLInputElement
    connectButton: HTMLButtonElement
    disconnectButton: HTMLButtonElement

    constructor() {
        this.restoredDiv = document.createElement('div')
        this.restoredDiv.classList.add('connectionDiv')
        document.getElementById('guiHeader')?.appendChild(this.restoredDiv)  // TODO

        const localGatewayDiv = document.createElement('div')
        localGatewayDiv.classList.add('gatewayDiv')
        localGatewayDiv.classList.add('local')
        this.restoredDiv.appendChild(localGatewayDiv)

        const localIcon = document.createElement('i')
        localIcon.classList.add('icon-server')
        localIcon.classList.add('local')
        localGatewayDiv.appendChild(localIcon)

        this.localHostname = document.createElement('span')
        this.localHostname.classList.add('hostname')
        localGatewayDiv.appendChild(this.localHostname)



        const remoteGatewayDiv = document.createElement('div')
        remoteGatewayDiv.classList.add('gatewayDiv')
        remoteGatewayDiv.classList.add('remote')
        this.restoredDiv.appendChild(remoteGatewayDiv)

        const remoteIcon = document.createElement('i')
        remoteIcon.classList.add('icon-server')
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

    updateContent(gameState: GameState) {
        this.localHostname.textContent = gameState.localGateway.hostname!
        this.remoteHostname.textContent = gameState.remoteGateway?.hostname || ''

        const connection = gameState.localGateway.outboundConnection

        if (!connection || connection.status === ConnectionStatus.DISCONNECTED) {
            this.remoteIpInput.classList.remove('hidden')
            this.connectButton.classList.remove('hidden')
            this.disconnectButton.classList.add('hidden')
        }

        if (connection && connection.status === ConnectionStatus.CONNECTED) {
            this.remoteIpInput.classList.add('hidden')
            this.connectButton.classList.add('hidden')
            this.disconnectButton.classList.remove('hidden')
        }

    }
}
