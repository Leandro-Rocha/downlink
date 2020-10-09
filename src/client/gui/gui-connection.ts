import { connectToGateway } from "../client.js"


export class ConnectionWindow {
    restoredDiv: HTMLDivElement
    localHostname: HTMLSpanElement
    remoteHostname: HTMLSpanElement
    remoteIpInput: HTMLInputElement
    connectToRemoteButton: HTMLButtonElement

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

        this.connectToRemoteButton = document.createElement('button')
        this.connectToRemoteButton.classList.add('connectButton')
        this.connectToRemoteButton.innerText = 'Connect!'
        this.connectToRemoteButton.addEventListener('click', () => connectToGateway(this.remoteIpInput.value))
        remoteGatewayDiv.appendChild(this.connectToRemoteButton)



    }

    updateContent(data: { localHostname: string }) {
        this.localHostname.textContent = data.localHostname
    }

}
