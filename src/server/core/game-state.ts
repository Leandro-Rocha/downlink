import { createNamespace, getNamespace } from 'cls-hooked'
import { ConnectionStatus } from "../../common/constants"
import { GameState, Gui } from "../../common/types"
import { Log } from "./log"
import { Player } from "./owner"

const CONTEXT_NAME = 'playerContext'

export function getCurrentPlayer(): Player {
    return getNamespace(CONTEXT_NAME)?.get('player')
}

export function createPlayerContext() {
    return createNamespace(CONTEXT_NAME)
}

export function createClientState(player: Player) {

    const gameState: GameState = {
        localGateway: player.gateway.toClient(),
        hackedDB: player.hackedDB.toClient()
    }

    gameState.localGateway.log = new Log({ entries: [...player.gateway.log.entries] })

    // TODO: move to method
    if (player.gateway.outboundConnection?.status !== ConnectionStatus.DISCONNECTED) {
        if (player.gateway.outboundConnection?.gateway !== undefined) {

            gameState.remoteGateway = player.gateway.outboundConnection.gateway.toClient()
            delete gameState.remoteGateway.outboundConnection

            if (player.gateway.outboundConnection.status === ConnectionStatus.LOGGED) {
                gameState.remoteGateway.log = new Log({ entries: [...player.gateway.outboundConnection.gateway.log.entries] })
            }
        }
    }


    return gameState
}
