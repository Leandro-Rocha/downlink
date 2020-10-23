import { createNamespace, getNamespace } from 'cls-hooked'
import { ConnectionStatus, SocketEvents } from "../../common/constants"
import { GameStateType } from "../../common/types"
import { Log } from "./log"
import { Player } from './player/player'
import io from 'socket.io'

const CONTEXT_NAME = 'playerContext'

export function getCurrentPlayer(): Player {
    return getNamespace(CONTEXT_NAME)?.get('player')
}

export function createPlayerContext() {
    return createNamespace(CONTEXT_NAME)
}

export function createClientState(player: Player) {

    const gameState: GameStateType = {
        timestamp: process.hrtime()[1],
        userName: player.userName,
        localGateway: player.gateway.toClient(),
        hackedDB: player.hackedDB.toClient()
    }

    gameState.localGateway.log = new Log({ entries: [...player.gateway.log.entries] })

    // TODO: move to method
    if (player.gateway.outboundConnection && player.gateway.outboundConnection.status !== ConnectionStatus.DISCONNECTED) {

        if (player.gateway.outboundConnection?.gateway !== undefined) {

            gameState.remoteGateway = player.gateway.outboundConnection.gateway.toClient()
            delete gameState.remoteGateway.outboundConnection

            if (player.gateway.outboundConnection.status !== ConnectionStatus.LOGGED) {
                delete gameState.remoteGateway.log
                delete gameState.remoteGateway.storage
            }
        }
    }


    return gameState
}


export function sendClientState(socket: io.Socket, player: Player) {
    console.log(`Updating player [${player.userName}] on socket [${socket.id}]`)

    socket.emit(SocketEvents.UPDATE_STATE, createClientState(player))
}