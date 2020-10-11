import { ErrorCodes, SocketEvents } from "../common/constants.js"
import { GameStateType } from "../common/types.js"
import { godMode, updateGameState } from "./client.js"
import { guiLoadingScreen } from "./gui/gui-loading.js"
import { guiRegister, guiContainer } from "./gui/gui.js"

export const socket = io()

socket.on(SocketEvents.ERROR, (error: any) => handleError(error))

socket.on(SocketEvents.CONNECT, () => playerConnected())
socket.on(SocketEvents.PLAYER_AUTHENTICATED, (newState: GameStateType) => playerAuthenticated(newState))

socket.on(SocketEvents.UPDATE_STATE, (newState: GameStateType) => updateGameState(newState))
socket.on(SocketEvents.GOD_MODE, (newState: any) => godMode(newState))


function playerConnected() {
    console.log('Connected to server')
    socket.emit(SocketEvents.PLAYER_CONNECT, localStorage.getItem('user'))
}

function playerAuthenticated(newState: GameStateType) {

    guiLoadingScreen.classList.add('hidden')
    guiRegister.element.classList.add('hidden')
    guiContainer.classList.remove('hidden')

    updateGameState(newState)
}

function handleError(error: ErrorCodes) {
    console.log(`Error [${ErrorCodes[error]}]`)

    if (error === ErrorCodes.PLAYER_NOT_FOUND) {
        guiRegister.element.classList.remove('hidden')
        guiContainer.classList.add('hidden')
        guiLoadingScreen.classList.add('hidden')

    }
}