import faker from 'faker'
import { createInitialGateway, Gateway } from "../server/core/gateway";
import { GatewayStore } from "./gateway-store";
import { PlayerStore } from "./player-store";
import { File } from '../server/core/resource'
import { PasswordCracker } from '../server/core/software/password-cracker';
import { Player } from '../server/core/player/player';

export async function generateGateways() {
    GatewayStore.clear()

    for (let i = 0; i < 10; i++) {
        const gateway = new Gateway({ hostname: `${faker.company.companyName()} ${faker.company.companySuffix()}` })

        for (let j = 0; j < 5; j++) {
            gateway.storage.files.push(new File({ name: faker.system.fileName(), size: faker.random.number({ min: 100, max: 1000 }) }))
        }

        GatewayStore.saveGateway(gateway)
    }
}

export async function generatePlayers() {
    PlayerStore.clear()
    const player = new Player('alze')
    player.gateway = createInitialGateway('alze')

    PlayerStore.savePlayer(player)
    GatewayStore.saveGateway(player.gateway)
}