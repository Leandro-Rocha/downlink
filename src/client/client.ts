import './internals.js'
import { PlayerActions, socketEvents } from '../common/constants.js'
import { GameState } from '../common/types.js'
import { socket } from './socket.js'
import { hackedDB, localLog, localFileManagerWindow, taskManager, remoteLog, remoteFileManagerWindow, localDomain, remoteDomain, connectionWindow } from './gui/gui.js'

document.querySelector('#remoteLoginBtn')?.addEventListener('click', login)
document.querySelector('#registerUserBtn')?.addEventListener('click', registerUser)


var gameState: GameState

export function playerConnected() {
    socket.emit(socketEvents.PLAYER_CONNECT, localStorage.getItem('user'))
}

function registerUser() {
    const userName = (<HTMLInputElement>document.querySelector('#registerUserInput')).value
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

export function updateGameState(newState: GameState) {
    console.log(socket.id, newState)

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
        connectionWindow.updateContent({ localHostname: gameState.localGateway.hostname })
    }

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


    const userName = (<HTMLInputElement>document.querySelector('#userNameInput'))
    const password = (<HTMLInputElement>document.querySelector('#passwordInput'))
    const hackedDbEntry = gameState.hackedDB.entries?.find(e => e.ip === gameState.remoteGateway!.ip)



    // if (hackedDbEntry !== undefined) {
    //     userName.value = hackedDbEntry.users[0].userName
    //     password.value = hackedDbEntry.users[0].password
    // }
    // else {
    //     userName.value = ''
    //     password.value = ''
    // }

}

export function godMode(newState: any) {
    console.log('god mode', newState)

}
