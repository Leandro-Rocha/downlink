import io from 'socket.io'
import { AccessPrivileges, ConnectionStatus, PlayerActions } from "../../common/constants"
import { Owner, Types } from "../../common/types"
import { Gateway } from "./gateway"
import { GatewayStore } from "../../storage/gateway-store"
import { HackedDB, HackedDbEntry } from './player/hacked-db'
import { createNamespace } from 'cls-hooked'
import { createPlayerContext } from './game-state'


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
    hackedDB: HackedDB

    constructor(name: string, userName: string, hackedDB?: HackedDB) {
        this.name = name
        this.userName = userName
        this.hackedDB = hackedDB || new HackedDB()



        //TODO: implement better way to handle multiple updates in a short interval
        // setInterval(() => {
        //     if (this.stateChanged)
        //         updateGameState(createClientState(this)!), 500
        //     this.stateChanged = false
        // })
    }

    handlePlayerAction(action: PlayerActions, ...args: any[]) {

        const context = createPlayerContext()
        context.run(() => {
            context.set('player', this)
            const connection = this.gateway.outboundConnection

            if (action === PlayerActions.CONNECT_TO_GATEWAY) {
                const [ip] = [...args]
                this.onConnectToGateway(ip)
            }

            if (action === PlayerActions.LOGIN) {
                const [userName, password] = [...args]
                this.onRemoteLogin(userName, password)
            }

            if (action === PlayerActions.EXECUTE_SOFTWARE) {
                const [id, ...params] = [...args]
                this.onExecuteSoftware(id, ...params)
            }
        })
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
        this.gateway.outboundConnection?.gateway.login(userName, password)
    }

    onExecuteSoftware(id: string, ...args: any[]) {
        // TODO: move error to gateway and add observer to player
        this.gateway.executeSoftware(this, id, ...args)
    }

}
