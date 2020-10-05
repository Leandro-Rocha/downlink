import { Gui } from "../../common/types.js"
import { connectToGateway } from "../client.js"
import { Window, WindowConfig } from "../window.js"

export class RemoteConnectionWindow extends Window<Gui.RemoteConnection> {

    remoteIpInput: HTMLInputElement
    connectToRemoteButton: HTMLButtonElement

    constructor(config: WindowConfig) {
        super(config)

        this.remoteIpInput = document.createElement('input')

        this.connectToRemoteButton = document.createElement('button')
        this.connectToRemoteButton.innerText = 'Connect!'
        this.connectToRemoteButton.addEventListener('click', () => connectToGateway(this.remoteIpInput.value))

        this.contentElement.appendChild(this.remoteIpInput)
        this.contentElement.appendChild(this.connectToRemoteButton)
    }

    updateContent(data: Gui.RemoteConnection): void {


    }
}