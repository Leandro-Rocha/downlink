import { PlayerActions, socketEvents } from '../common/constants.js'
import { GameState, Types } from '../common/types.js'
import { socket } from './socket.js'
import { FileManagerWindow } from './window.js'

document.querySelector('#resetDataBtn')?.addEventListener('click', resetData)
document.querySelector('#connectToGatewayBtn')?.addEventListener('click', connectToGateway)
document.querySelector('#remoteLoginBtn')?.addEventListener('click', login)
document.querySelector('#registerUserBtn')?.addEventListener('click', registerUser)

const remoteIpInput = (<HTMLInputElement>document.querySelector('#remoteIpInput'))

const remoteGatewayDiv = (<HTMLDivElement>document.querySelector('#remoteGateway'))
const localGatewayDiv = (<HTMLDivElement>document.querySelector('#localGateway'))
const remoteSshTab = (<HTMLInputElement>document.querySelector('#remote_ssh'))
const remoteLogTab = (<HTMLInputElement>document.querySelector('#remoteLogDiv'))

const fileManager = new FileManagerWindow({ id: 'file-manager', title: 'File Manager' })
const taskManager = new FileManagerWindow({ id: 'task-manager', title: 'Task Manager' })

fileManager.test = 'olá mundo!!'
console.log(`fileManager.test`, fileManager.test)

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
    ip.textContent = gameState.localGateway.ip!

    const localLog = (<HTMLInputElement>document.querySelector('#localLog'))
    localLog.value = ''
    if (gameState.localGateway.log !== undefined) {
        gameState.localGateway.log.entries.forEach(entry => localLog.value += `${entry.timestamp} - ${entry.message}\n`)
    }

    if (gameState.localGateway.storage !== undefined) {
        fileManager.updateContent(gameState.localGateway.storage)
    }

    if (gameState.localGateway.taskManager !== undefined) {
        const taskManagerTable = (<HTMLTableElement>document.querySelector('#localTaskManager'))
        taskManagerTable.querySelectorAll('tr').forEach(c => c.remove())
        taskManagerTable.innerHTML = '<thead><td>PID</td><td>progress</td></thead>'

        gameState.localGateway.taskManager.workerProcesses.forEach(p => {
            const processRow = document.createElement('tr')
            const pidElement = processRow.appendChild(document.createElement('td'))
            const progressElement = processRow.appendChild(document.createElement('td'))

            pidElement.textContent = p.pid

            var workDone = (<Types.WorkerProcess>p).workDone
            var totalWork = (<Types.WorkerProcess>p).totalWork

            setInterval(() => {
                workDone += 1000 / 30
                progressElement.textContent = `${Math.round(workDone / totalWork * 100)}%`
            }, 1000 / 30)

            taskManagerTable.appendChild(processRow)
        })
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