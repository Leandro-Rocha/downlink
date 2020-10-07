import { PlayerActions, socketEvents } from '../common/constants.js'
import { GameState } from '../common/types.js'
import { FileManagerWindow } from './gui/gui-file-manager.js'
import { HackedDbWindow } from './gui/gui-hacked-db.js'
import { LogWindow } from './gui/gui-log.js'
import { TaskManagerWindow } from './gui/gui-task-manager.js'
import { RemoteConnectionWindow } from './gui/window-remote-connection.js'
import { socket } from './socket.js'
import { WindowDomain } from './window.js'

document.querySelector('#resetDataBtn')?.addEventListener('click', resetData)
document.querySelector('#remoteLoginBtn')?.addEventListener('click', login)
document.querySelector('#registerUserBtn')?.addEventListener('click', registerUser)

const remoteIpInput = (<HTMLInputElement>document.querySelector('#remoteIpInput'))

const remoteSshTab = document.querySelector('#remote_ssh') as HTMLInputElement

const localLog = new LogWindow({ id: 'local-log', title: 'Local Log', domain: WindowDomain.LOCAL })
const localFileManagerWindow = new FileManagerWindow({ id: 'local-file-manager', title: 'File Manager', domain: WindowDomain.LOCAL })
const taskManager = new TaskManagerWindow({ id: 'task-manager', title: 'Task Manager', domain: WindowDomain.LOCAL })
const hackedDB = new HackedDbWindow({ id: 'hacked-db', title: 'HackedDB', domain: WindowDomain.LOCAL })

const remoteConnectionWindow = new RemoteConnectionWindow({ id: 'remote-connection', title: 'Remote Connection', domain: WindowDomain.REMOTE })
const remoteLog = new LogWindow({ id: 'remote-log', title: 'Remote Log', domain: WindowDomain.REMOTE })
const remoteFileManagerWindow = new FileManagerWindow({ id: 'remote-file-manager', title: 'File Manager', domain: WindowDomain.REMOTE })

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
    console.log(socket.id ,newState)

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

    // ip.textContent = gameState.remoteGateway.ip!

    // owner.textContent = gameState.remoteGateway.hostname!

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


export function resetData() {
    // socket.emit(socketEvents.RESET_DATA)
}