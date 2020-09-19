import faker from 'faker'
import { Gateway } from "../server/core/gateway";
import { GatewayStore } from "./gateway-store";
import { PlayerStore } from "./player-store";
import { Player } from "../server/core/owner";

export async function generateGateways() {
    GatewayStore.clear()

    for (let i = 0; i < 10; i++) {
        const gateway = new Gateway({ hostname: `${faker.company.companyName()} ${faker.company.companySuffix()}` })
        gateway.users!.push({ userName: 'root', password: faker.internet.password() })

        GatewayStore.saveGateway(gateway)
    }
}

export async function generatePlayers() {
    PlayerStore.clear()
    const player = new Player('Leandro', 'alze')
    player.gateway = new Gateway({ hostname: 'alze-gateway' })


    PlayerStore.savePlayer(player)
    GatewayStore.saveGateway(player.gateway)
}