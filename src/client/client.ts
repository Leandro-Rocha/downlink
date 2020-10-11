import './internals.js'
import { PlayerActions, SocketEvents } from '../common/constants.js'
import { socket } from './socket.js'
import { hackedDB, localLog, localFileManagerWindow, taskManager, remoteLog, remoteFileManagerWindow, localDomain, remoteDomain, connectionWindow, guiRegister, guiContainer } from './gui/gui.js'
import { GameStateType } from '../common/types.js'



guiContainer.classList.add('hidden')


export function registerUser(userName: string) {
    localStorage.setItem('user', userName)
    socket.emit(SocketEvents.REGISTER_USER, userName)
    window.location.reload()
}

function login() {
    const userName = (<HTMLInputElement>document.querySelector('#userNameInput')).value
    const password = (<HTMLInputElement>document.querySelector('#passwordInput')).value
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
    localDomain.navigation.updateState({ hostname: newState.localGateway.hostname })
    remoteDomain.navigation.updateState({ hostname: newState.remoteGateway?.hostname })

    updateLocalGateway(newState)
    updateRemoteGateway(newState)
}

function updateLocalGateway(newState: GameStateType) {

    hackedDB.updateContent(newState.hackedDB)
    localLog.updateState(newState.localGateway.log)
    localFileManagerWindow.updateState(newState.localGateway.storage)
    taskManager.updateState(newState.localGateway.taskManager)
}

function updateRemoteGateway(newState: GameStateType) {

    remoteLog.updateState(newState.remoteGateway?.log)
    remoteFileManagerWindow.updateState(newState.remoteGateway?.storage)
}

export function godMode(newState: any) {
    console.log('god mode', newState)

}
