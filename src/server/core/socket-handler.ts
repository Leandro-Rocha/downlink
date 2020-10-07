import io from 'socket.io'
import http from 'http'
import { ConnectionStatus, PlayerActions, socketEvents } from '../../common/constants'
import { PlayerStore } from '../../storage/player-store'
import { GatewayStore } from '../../storage/gateway-store'
import { createClientState, createPlayerContext } from './game-state'
import { Gateway } from './gateway'
import { SIGNALS } from './signal'
import { Process } from './process'
import { TaskManager } from './task-manager'
import { createNamespace } from 'cls-hooked'
import { RemoteConnection } from './network-interfaces'
import { onRegisterUser } from '../infra/register-player'
import { Player } from './player/player'

export function createSocketHandler(config: { httpServer: http.Server }) {
    return new SocketHandler(config.httpServer)
}

class SocketHandler {
    private io!: io.Server
    private httpServer: http.Server

    constructor(httpServer: http.Server) {
        this.httpServer = httpServer
    }

    start() {
        this.io = io(this.httpServer)

        this.io.on('connection', (socket) => {
            console.log('New connection: ' + socket.id)

            socket.once(socketEvents.PLAYER_CONNECT, (userName) => onPlayerConnect(socket, userName))
            socket.on(socketEvents.REGISTER_USER, (userName) => onRegisterUser(userName))

            socket.emit(socketEvents.GOD_MODE, GatewayStore.getAll().map(g => g.ip))
        })
    }

    end() {
        console.log('Closing sockets')
        this.io.close()
        console.log('Closing sockets: done')
    }
}

// TODO: implement player authentication
function onPlayerConnect(socket: io.Socket, userName: string) {
    const player = PlayerStore.getPlayerByUsername(userName)

    if (player === undefined) {
        console.log(`Player not found`)
        socket.emit(socketEvents.ERROR, `Player not found`)
        return
    }

    setPlayerEvents(socket, player)
    registerPlayerSignals(socket, player)

    sendClientState(socket, player)
}

function setPlayerEvents(socket: io.Socket, player: Player) {
    socket.on('disconnect', (socket: io.Socket) => onPlayerDisconnect(socket, player))

    socket.on(socketEvents.PLAYER_ACTION, (action: PlayerActions, ...args: any[]) => {
        player.handlePlayerAction(action, ...args)

    })

    console.info(`Player[${player.userName}] socket is registered to [${socket.eventNames()}]`)
}


function registerPlayerSignals(socket: io.Socket, player: Player) {

    player.gateway.registerHandler(player, SIGNALS.NEW_REMOTE_CONNECTION, (gateway: Gateway, outboundConnection: RemoteConnection) =>
        outboundConnection.registerHandler(player, SIGNALS.REMOTE_CONNECTION_CHANGED, () => sendClientState(socket, player)))

    player.gateway.log.registerHandler(player, SIGNALS.LOG_CHANGED, () => sendClientState(socket, player))
    player.gateway.outboundConnection?.registerHandler(player, SIGNALS.REMOTE_CONNECTION_CHANGED, () => sendClientState(socket, player))

    player.gateway.taskManager.processes.forEach(p => {
        p.checkStatus()

        p.registerHandler(player, SIGNALS.PROCESS_STARTED, () => sendClientState(socket, player))
        p.registerHandler(player, SIGNALS.PROCESS_FINISHED, () => sendClientState(socket, player))
        p.registerHandler(player, SIGNALS.PROCESS_UPDATED, () => sendClientState(socket, player))
    })

    player.gateway.taskManager.registerHandler(player, SIGNALS.TASK_SCHEDULED, (taskManager: TaskManager, process: Process) => {
        process.registerHandler(player, SIGNALS.PROCESS_STARTED, () => sendClientState(socket, player))
        process.registerHandler(player, SIGNALS.PROCESS_FINISHED, () => sendClientState(socket, player))
        process.registerHandler(player, SIGNALS.PROCESS_UPDATED, () => sendClientState(socket, player))
    })

    player.gateway.taskManager.registerHandler(player, SIGNALS.TASK_UNSCHEDULED, (taskManager: TaskManager, process: Process) => {
        process.unregisterHandler(player)
        sendClientState(socket, player)
    })
}

function onPlayerDisconnect(socket: io.Socket, player: Player) {
    console.info(`[${player.userName}] disconnected: [${socket}]`)

    unregisterPlayerSignals(player)
}

function unregisterPlayerSignals(player: Player) {
    player.gateway.log.unregisterHandler(player)
    player.gateway.outboundConnection?.unregisterHandler(player)
    player.gateway.taskManager.unregisterHandler(player)
}


function sendClientState(socket: io.Socket, player: Player) {
    console.log(`Updating player [${player.userName}] on socket [${socket.id}]`)

    socket.emit(socketEvents.UPDATE_STATE, createClientState(player))
}

// TODO: define client error handling
function emitError(message: string) {
    console.log(`Emitting error message: ${message}`)
    // this.socket.emit(socketEvents.ERROR, { message })
}








// socket.on('start download', async bounceArray => {
//     // users.set(userInfo.user, { name: userInfo.user })

//     const gatewayList = GatewayStore.getGatewayListByIp(...bounceArray)

//     const factory = new FileTransferFactory(new File('test', 100), ...gatewayList)
//     const result = factory.create()
//     result.details[0].stream.updateBandwidth()
//     console.log(`result`, result.details[0].stream)


//     const allGateways = GatewayStore.getAll()
//     socket.emit('dataUpdate', allGateways)
// })

// socket.on(socketEvents.RESET_DATA, () => {
//     generateGateways()
//     generatePlayers()
//     socket.emit(socketEvents.UPDATE_STATE, GatewayStore.getAll())
// })

