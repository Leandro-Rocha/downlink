import './internals.js'
import { PlayerActions, SocketEvents } from '../common/constants.js'
import { socket } from './socket.js'
import { hackedDBWindow, localLogWindow, localFileManagerWindow, taskManagerWindow, remoteLogWindow, remoteFileManagerWindow, localDomain, remoteDomain, connectionWindow, guiContainer } from './gui/gui.js'
import { GameStateType } from '../common/types.js'



guiContainer.classList.add('hidden')


export function registerUser(userName: string) {
    localStorage.setItem('user', userName)
    socket.emit(SocketEvents.REGISTER_USER, userName)
    window.location.reload()
}

export function login(userName: string, password: string) {
    socket.emit(SocketEvents.PLAYER_ACTION, PlayerActions.LOGIN, userName, password)
}

export function connectToGateway(remoteIp: string) {
    socket.emit(SocketEvents.PLAYER_ACTION, PlayerActions.CONNECT_TO_GATEWAY, remoteIp)
}

export function disconnect() {
    socket.emit(SocketEvents.PLAYER_ACTION, PlayerActions.DISCONNECT)
}

export function updateGameState(newState: GameStateType) {
    console.log(socket.id, newState)

    connectionWindow.updateState(newState)
    localDomain.navigation.updateState(newState.localGateway)
    remoteDomain.navigation.updateState(newState.remoteGateway)

    updateLocalGateway(newState)
    updateRemoteGateway(newState)
}

function updateLocalGateway(newState: GameStateType) {

    hackedDBWindow.updateContent(newState.hackedDB)
    localLogWindow.updateState(newState.localGateway.log)
    localFileManagerWindow.updateState(newState.localGateway.storage)
    taskManagerWindow.updateState(newState.localGateway.taskManager)
}

function updateRemoteGateway(newState: GameStateType) {
    remoteLogWindow.updateState(newState.remoteGateway?.log)
    remoteFileManagerWindow.updateState(newState.remoteGateway?.storage)
}

export function godMode(newState: any) {
    console.log('god mode', newState)

}
