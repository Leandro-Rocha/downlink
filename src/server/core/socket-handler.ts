import io from 'socket.io'
import http from 'http'
import { ErrorCodes, PlayerActions, SocketEvents } from '../../common/constants'
import { PlayerStore } from '../../storage/player-store'
import { GatewayStore } from '../../storage/gateway-store'
import { createClientState, sendClientState } from './game-state'
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

            socket.once(SocketEvents.PLAYER_CONNECT, (userName) => onPlayerConnect(socket, userName))
            socket.on(SocketEvents.REGISTER_USER, (userName) => onRegisterUser(userName))

            socket.emit(SocketEvents.GOD_MODE, GatewayStore.getAll().map(g => g.ip))
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
        socket.emit(SocketEvents.ERROR, ErrorCodes.PLAYER_NOT_FOUND)
        return
    }

    setPlayerEvents(socket, player)
    registerPlayerSignals(socket, player)

    socket.emit(SocketEvents.PLAYER_AUTHENTICATED, createClientState(player))
}

function setPlayerEvents(socket: io.Socket, player: Player) {
    player.socket = socket
    socket.on('disconnect', (socket: io.Socket) => onPlayerDisconnect(socket, player))

    socket.on(SocketEvents.PLAYER_ACTION, (action: PlayerActions, ...args: any[]) => {
        player.handlePlayerAction(action, ...args)

    })

    console.info(`Player[${player.userName}] socket is registered to [${socket.eventNames()}]`)
}


function registerPlayerSignals(socket: io.Socket, player: Player) {
    player.watch(player.gateway)
}

function onPlayerDisconnect(socket: io.Socket, player: Player) {
    console.info(`[${player.userName}] disconnected: [${socket}]`)

    player.unwatch(player.gateway)
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

