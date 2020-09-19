import io from 'socket.io'
import http from 'http'
import { ConnectionStatus, PlayerActions, socketEvents } from '../../common/constants'
import { PlayerStore } from '../../storage/player-store'
import { GatewayStore } from '../../storage/gateway-store'
import { Player } from './owner'
import { createClientState } from './game-state'
import { Gateway } from './gateway'
import { SIGNALS } from './signal'

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
            console.debug('New connection: ' + socket.id)

            socket.once(socketEvents.PLAYER_CONNECT, (userName) => onPlayerConnect(socket, userName))
            socket.on(socketEvents.REGISTER_USER, (userName) => onRegisterUser(userName))

            socket.emit(socketEvents.GOD_MODE, GatewayStore.getAll().map(g => g.ip))
        })
    }

    end() {
        console.debug('Closing sockets')
        this.io.close()
        console.debug('Closing sockets: done')
    }
}

// TODO: implement player authentication
function onPlayerConnect(socket: io.Socket, userName: string) {
    const player = PlayerStore.getPlayerByUsername(userName)

    if (player === undefined) {
        console.debug(`Player not found`)
        socket.emit(socketEvents.ERROR, `Player not found`)
        return
    }

    setPlayerEvents(socket, player)
    registerPlayerSignals(socket, player)

    socket.emit(socketEvents.UPDATE_STATE, createClientState(player))
}

function setPlayerEvents(socket: io.Socket, player: Player) {
    socket.on('disconnect', (socket: io.Socket) => onPlayerDisconnect(socket, player))

    socket.on(socketEvents.PLAYER_ACTION, (action: PlayerActions, ...args: any[]) => player.handlePlayerAction(action, ...args))

    console.info(`Player[${player.userName}] socket is registered to[${socket.eventNames()}]`)
}


function registerPlayerSignals(socket: io.Socket, player: Player) {
    player.gateway.log.registerHandler(player, SIGNALS.LOG_CHANGED, () => sendClientState(socket, player))
    player.gateway.outboundConnection.registerHandler(player, SIGNALS.REMOTE_CONNECTION_CHANGED, () => sendClientState(socket, player))
}

function onPlayerDisconnect(socket: io.Socket, player: Player) {
    console.debug(`[${player.userName}] disconnected: [${socket}]`)

    unregisterPlayerSignals(player)
}

function unregisterPlayerSignals(player: Player) {
    player.gateway.log.unregisterHandler(player)
    player.gateway.outboundConnection.unregisterHandler(player)
}


function sendClientState(socket: io.Socket, player: Player) {
    socket.emit(socketEvents.UPDATE_STATE, createClientState(player))
}

// TODO: define client error handling
function emitError(message: string) {
    console.log(`Emitting error message: ${message}`)
    // this.socket.emit(socketEvents.ERROR, { message })
}




function onRegisterUser(userName: string) {
    const newPlayer = new Player(userName, userName)
    newPlayer.gateway = new Gateway()

    GatewayStore.saveGateway(newPlayer.gateway)
    PlayerStore.savePlayer(newPlayer)
    console.debug(`New player registered: ${userName}`)
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

