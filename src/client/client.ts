import './internals.js'
import { PlayerActions, socketEvents } from '../common/constants.js'
import { GameState } from '../common/types.js'
import { socket } from './socket.js'
import { hackedDB, localLog, localFileManagerWindow, taskManager, remoteLog, remoteFileManagerWindow, localDomain, remoteDomain, connectionWindow, guiRegister, guiBase } from './gui/gui.js'


var gameState: GameState

guiBase.classList.add('hidden')

export function playerConnected() {
    socket.emit(socketEvents.PLAYER_CONNECT, localStorage.getItem('user'))
}

export function registerUser(userName: string) {
    localStorage.setItem('user', userName)
    socket.emit(socketEvents.REGISTER_USER, userName)
    window.location.reload()
}

function login() {
    const userName = (<HTMLInputElement>document.querySelector('#userNameInput')).value
    const password = (<HTMLInputElement>document.querySelector('#passwordInput')).value
    socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.LOGIN, userName, password)
}

export function connectToGateway(remoteIp: string) {
    socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.CONNECT_TO_GATEWAY, remoteIp)
}

export function disconnect() {
    socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.DISCONNECT)
}

export function updateGameState(newState: GameState) {
    console.log(socket.id, newState)

    guiRegister.element.classList.add('hidden')
    guiBase.classList.remove('hidden')

    gameState = newState

    updateLocalGateway()
    updateRemoteGateway()
}

function updateLocalGateway() {
    if (gameState === undefined) {
        return
    }

    if (gameState.localGateway.hostname) {
        localDomain.navigation.updateContent({ hostname: gameState.localGateway.hostname })
    }

    connectionWindow.updateContent(gameState)

    hackedDB.updateContent(gameState.hackedDB)

    if (gameState.localGateway.log !== undefined) {
        localLog.updateContent(gameState.localGateway.log)
    }

    if (gameState.localGateway.storage !== undefined) {
        localFileManagerWindow.updateContent(gameState.localGateway.storage)
    }

    if (gameState.localGateway.taskManager !== undefined) {
        taskManager.updateContent(gameState.localGateway.taskManager)
    }

}

function updateRemoteGateway() {
    if (gameState?.remoteGateway === undefined) {
        return
    }

    if (gameState.remoteGateway.hostname) {
        remoteDomain.navigation.updateContent({ hostname: gameState.remoteGateway.hostname })
    }

    if (gameState.remoteGateway.log !== undefined) {
        remoteLog.updateContent(gameState.remoteGateway.log)
    }

    if (gameState.remoteGateway.storage !== undefined) {
        remoteFileManagerWindow.updateContent(gameState.remoteGateway.storage)
    }
}

export function godMode(newState: any) {
    console.log('god mode', newState)

}
