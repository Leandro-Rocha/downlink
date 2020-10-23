import io from 'socket.io'
import { AccessPrivileges, PlayerActions, ToastSeverity } from "../../../common/constants"
import { GatewayStore } from "../../../storage/gateway-store"
import { createPlayerContext, sendClientState } from "../game-state"
import { Gateway } from "../gateway"
import { watcher, Watcher } from '../signal'
import { sendToast } from '../toast'
import { HackedDB } from "./hacked-db"

export interface Player extends Watcher { }

@watcher
export class Player {
    userName: string

    socket!: io.Socket
    gateway!: Gateway

    stateChanged: boolean = false

    privilegesMap: Map<string, AccessPrivileges[]> = new Map()
    hackedDB: HackedDB

    constructor(userName: string, hackedDB?: HackedDB) {
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

            if (action === PlayerActions.CONNECT_TO_GATEWAY) {
                const [ip] = [...args]
                this.onConnectToGateway(ip)
            }

            if (action === PlayerActions.DISCONNECT) {
                this.onDisconnect()
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

    handlePropagation(signal: string) {
        console.log(`Handling signal [${signal}]`)
        sendClientState(this.socket, this)
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

    onDisconnect() {
        // TODO: move error to gateway and add observer to player
        this.gateway.disconnect()
    }

    onRemoteLogin(userName: string, password: string) {
        this.gateway.outboundConnection?.gateway.login(userName, password)
    }

    onExecuteSoftware(id: string, ...args: any[]) {
        // TODO: move error to gateway and add observer to player
        try {
            this.gateway.executeSoftware(id, ...args)
        }
        catch (error) {
            sendToast(this.socket, error.message, ToastSeverity.ERROR)
        }
    }

}