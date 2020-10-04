import { socketEvents } from "../../common/constants"
import { GatewayStore } from "../../storage/gateway-store"
import { PlayerStore } from "../../storage/player-store"
import { createInitialGateway, Gateway } from "../core/gateway"
import { Player } from "../core/player/player"





export function onRegisterUser(userName: string) {
    if (PlayerStore.getPlayerByUsername(userName)) {
        console.log(`Player ${userName} already registered`)
        return
    }

    const newPlayer = new Player(userName)
    newPlayer.gateway = createInitialGateway(userName)

    GatewayStore.saveGateway(newPlayer.gateway)
    PlayerStore.savePlayer(newPlayer)
    console.info(`New player registered: ${userName}`)
}
