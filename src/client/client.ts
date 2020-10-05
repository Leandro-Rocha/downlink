import { PlayerActions, socketEvents } from '../common/constants.js'
import { GameState, Gui } from '../common/types.js'
import { FileManagerWindow } from './gui/gui-file-manager.js'
import { HackedDbWindow } from './gui/gui-hacked-db.js'
import { LogWindow } from './gui/gui-log.js'
import { TaskManagerWindow } from './gui/gui-task-manager.js'
import { socket } from './socket.js'

document.querySelector('#resetDataBtn')?.addEventListener('click', resetData)
document.querySelector('#connectToGatewayBtn')?.addEventListener('click', connectToGateway)
document.querySelector('#remoteLoginBtn')?.addEventListener('click', login)
document.querySelector('#registerUserBtn')?.addEventListener('click', registerUser)

const remoteIpInput = (<HTMLInputElement>document.querySelector('#remoteIpInput'))

const remoteGatewayDiv = (<HTMLDivElement>document.querySelector('#remoteGateway'))
const remoteSshTab = document.querySelector('#remote_ssh') as HTMLInputElement
const remoteLogTab = (<HTMLInputElement>document.querySelector('#remoteLogDiv'))

const log = new LogWindow({ id: 'local-log', title: 'Local Log' })
const fileManager = new FileManagerWindow({ id: 'file-manager', title: 'File Manager' })
const taskManager = new TaskManagerWindow({ id: 'task-manager', title: 'Task Manager' })
const hackedDB = new HackedDbWindow({ id: 'hacked-db', title: 'HackedDB' })

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
        return
    }

    const ip = (<HTMLSpanElement>document.querySelector('#localIp'))
    // ip.textContent = gameState.localGateway.ip!

    const owner = (<HTMLSpanElement>document.querySelector('#localOwner'))
    // owner.textContent = gameState.userName

    hackedDB.updateContent(gameState.hackedDB)

    if (gameState.localGateway.log !== undefined) {
        log.updateContent(gameState.localGateway.log)
    }

    if (gameState.localGateway.storage !== undefined) {
        fileManager.updateContent(gameState.localGateway.storage)
    }

    if (gameState.localGateway.taskManager !== undefined) {
        taskManager.updateContent(gameState.localGateway.taskManager)
    }

}

function updateRemoteGateway() {
    if (gameState?.remoteGateway === undefined) {
        remoteGatewayDiv.classList.add('hidden')
        return
    }

    remoteGatewayDiv.classList.remove('hidden')

    const ip = (<HTMLSpanElement>document.querySelector('#remoteIp'))
    ip.textContent = gameState.remoteGateway.ip!

    const owner = (<HTMLSpanElement>document.querySelector('#remoteOwner'))
    owner.textContent = gameState.remoteGateway.hostname!

    const remoteLog = (<HTMLInputElement>document.querySelector('#remoteLog'))
    if (gameState.remoteGateway.log !== undefined) {
        remoteLog.classList.remove('hidden')
        remoteLog.value = ''
        gameState.remoteGateway.log.entries.forEach(entry => remoteLog.value += `${entry.message} \n`)
    } else {
        remoteLog.classList.add('hidden')
    }

    const userName = (<HTMLInputElement>document.querySelector('#userNameInput'))
    const password = (<HTMLInputElement>document.querySelector('#passwordInput'))
    const hackedDbEntry = gameState.hackedDB.entries?.find(e => e.ip === gameState.remoteGateway!.ip)
    if (hackedDbEntry !== undefined) {
        userName.value = hackedDbEntry.users[0].userName
        password.value = hackedDbEntry.users[0].password
    }
    else {
        userName.value = ''
        password.value = ''
    }

}

export function godMode(newState: any) {
    console.log('god mode', newState)

}


export function resetData() {
    // socket.emit(socketEvents.RESET_DATA)
}