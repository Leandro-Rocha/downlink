import { AccessPrivileges, ConnectionStatus, PlayerActions } from "../../common/constants"
import { Types, Owner } from "../../common/types"
import io from 'socket.io'
import { Gateway } from "./gateway"
import { updateGameState } from "../../client/client"
import { createClientState } from "./game-state"
import { GatewayStore } from "../../storage/gateway-store"


export class NPC implements Owner {
    name: string

    constructor(name: string) {
        this.name = name
    }
}

export class Player {
    name: string

    userName: string
    socket!: io.Socket
    gateway!: Gateway

    stateChanged: boolean = false

    privilegesMap: Map<string, AccessPrivileges[]> = new Map()

    constructor(name: string, userName: string) {
        this.name = name
        this.userName = userName

        //TODO:
        // setInterval(() => {
        //     if (this.stateChanged)
        //         updateGameState(createClientState(this)!), 500
        //     this.stateChanged = false
        // })
    }

    handlePlayerAction(action: PlayerActions, ...args: any[]) {
        const connection = this.gateway.outboundConnection

        if (action === PlayerActions.CONNECT_TO_GATEWAY) {
            const [ip] = [...args]
            this.onConnectToGateway(ip)
        }

        else if (connection.status === ConnectionStatus.CONNECTED) {
            const [userName, password] = [...args]
            this.onRemoteLogin(userName, password)
        }
    }

    onConnectToGateway(ip: string) {

        // TODO: move error to gateway and add observer to player
        const remoteGateway = GatewayStore.getGatewayByIp(ip)
        if (remoteGateway === undefined) {
            // emitError('ip not found')
            return
        }

        this.gateway.connectTo(remoteGateway)
    }

    onRemoteLogin(userName: string, password: string) {
        console.log(`Login attempt - userName[${userName}], password: [${password}]`)

        const user = this.gateway.outboundConnection.gateway?.users.find(u => u.userName === userName)

        // TODO: move error to gateway and add observer to player
        if (user === undefined) {
            console.debug(`user[${userName}]not found`)
            // emitError(`invalid credentials`)
            return
        }

        // TODO: move error to gateway and add observer to player
        if (user.password !== password) {
            console.debug(`input password[${password}] for user[${userName}]doesn't match [${user.password}]`)
            // emitError(`invalid credentials`)
            return
        }

        this.gateway.remoteLogin(user.userName)

        // this.socket.emit(socketEvents.UPDATE_STATE, createClientState(this.player))

    }

}
