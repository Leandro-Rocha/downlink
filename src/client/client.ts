import { PlayerActions, socketEvents } from '../common/constants.js'
import { GameState, Types } from '../common/types.js'
import { socket } from './socket.js'

document.querySelector('#resetDataBtn')?.addEventListener('click', resetData)
document.querySelector('#connectToGatewayBtn')?.addEventListener('click', connectToGateway)
document.querySelector('#remoteLoginBtn')?.addEventListener('click', login)
document.querySelector('#registerUserBtn')?.addEventListener('click', registerUser)

const remoteIpInput = (<HTMLInputElement>document.querySelector('#remoteIpInput'))

const remoteGatewayDiv = (<HTMLDivElement>document.querySelector('#remoteGateway'))
const localGatewayDiv = (<HTMLDivElement>document.querySelector('#localGateway'))
const remoteSshTab = (<HTMLInputElement>document.querySelector('#remote_ssh'))
const remoteLogTab = (<HTMLInputElement>document.querySelector('#remoteLogDiv'))

var gameState: GameState

export function playerConnected() {
    socket.emit(socketEvents.PLAYER_CONNECT, localStorage.getItem('user'))
}

function registerUser() {
    const userName = (<HTMLInputElement>document.querySelector('#registerUserInput')).value
    localStorage.setItem('user', userName)
    socket.emit(socketEvents.REGISTER_USER, userName)
    playerConnected()
}

function login() {
    const userName = (<HTMLInputElement>document.querySelector('#userNameInput')).value
    const password = (<HTMLInputElement>document.querySelector('#passwordInput')).value
    socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.LOGIN, userName, password)
}

export function connectToGateway() {
    const remoteIp = remoteIpInput.value
    socket.emit(socketEvents.PLAYER_ACTION, PlayerActions.CONNECT_TO_GATEWAY, remoteIp)
}

export function updateGameState(newState: GameState) {
    console.log(newState)

    gameState = newState

    updateLocalGateway()
    updateRemoteGateway()
}

function updateLocalGateway() {
    if (gameState === undefined) {
        localGatewayDiv.classList.add('hidden')
        return
    }

    localGatewayDiv.classList.remove('hidden')

    const ip = (<HTMLSpanElement>document.querySelector('#localIp'))
    ip.textContent = gameState.localGateway.ip

    const localLog = (<HTMLInputElement>document.querySelector('#localLog'))
    localLog.value = ''
    if (gameState.localGateway.log !== undefined) {
        gameState.localGateway.log.entries.forEach(entry => localLog.value += `${entry.message}\n`)
    }

}

function updateRemoteGateway() {
    if (gameState?.remoteGateway == undefined) {
        remoteGatewayDiv.classList.add('hidden')
        return
    }

    remoteGatewayDiv.classList.remove('hidden')

    const ip = (<HTMLSpanElement>document.querySelector('#remoteIp'))
    ip.textContent = gameState.remoteGateway.ip

    const owner = (<HTMLSpanElement>document.querySelector('#remoteOwner'))
    owner.textContent = gameState.remoteGateway.hostname

    const remoteLog = (<HTMLInputElement>document.querySelector('#remoteLog'))
    if (gameState.remoteGateway.log !== undefined) {
        remoteLog.classList.remove('hidden')
        remoteLog.value = ''
        gameState.remoteGateway.log.entries.forEach(entry => remoteLog.value += `${entry.message}\n`)
    } else {
        remoteLog.classList.add('hidden')
    }
}

export function godMode(newState: any) {
    console.log('god mode', newState)

}


export function resetData() {
    // socket.emit(socketEvents.RESET_DATA)
}