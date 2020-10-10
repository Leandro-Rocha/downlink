import { PlayerActions, SocketEvents } from "../../common/constants.js"
import { socket } from "../socket.js"
import { FileGuiElement } from "./gui-file.js"

export class SoftwareGuiElement extends FileGuiElement {

    constructor() {
        super()
        this.element.addEventListener('click', this.executeSoftware.bind(this))
    }

    executeSoftware() {
        socket.emit(SocketEvents.PLAYER_ACTION, PlayerActions.EXECUTE_SOFTWARE, this.data.id, this.getExecutionArgs())
    }

    getExecutionArgs() {
        return {}
    }
}