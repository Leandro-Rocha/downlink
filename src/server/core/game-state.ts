import { ConnectionStatus } from "../../common/constants"
import { Client, GameState, Types } from "../../common/types"
import { Log } from "./log"
import { Player } from "./owner"

export function createClientState(player: Player) {

    const gameState: GameState = {
        localGateway: convertServerToClient(player.gateway)
    }

    gameState.localGateway.log = new Log({ entries: [...player.gateway.log.entries] })

    if (player.gateway.outboundConnection?.status !== ConnectionStatus.DISCONNECTED) {
        if (player.gateway.outboundConnection?.gateway === undefined) {
            console.error(`gateway is CONNECTED without a remote gateway bound`)
            return
        }

        gameState.remoteGateway = convertServerToClient(player.gateway.outboundConnection.gateway)
        delete gameState.remoteGateway.outboundConnection

        if (player.gateway.outboundConnection.status === ConnectionStatus.LOGGED) {
            gameState.remoteGateway.log = new Log({ entries: [...player.gateway.outboundConnection.gateway.log.entries] })
        }
    }


    return gameState
}


function convertServerToClient(serverGateway: Types.Gateway): Client.Gateway {
    const clientGateway: Client.Gateway = {
        ip: serverGateway.ip,
        hostname: serverGateway.hostname,
        outboundConnection: { status: serverGateway.outboundConnection.status }
    }

    return clientGateway
}
