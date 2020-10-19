import faker from 'faker'
import { Gateway } from "../server/core/gateway";
import { GatewayStore } from "./gateway-store";
import { PlayerStore } from "./player-store";
import { File } from '../server/core/resource'
import { Player } from '../server/core/player/player';
import { NetworkScanner } from '../server/core/software/network-scanner';
import { PasswordCracker } from '../server/core/software/password-cracker';

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

/**
 * New players will start with this gateway config
 */
export function createInitialGateway(userName: string) {
    const newGateway = new Gateway({ hostname: `${userName}-gateway` })

    newGateway.storage.files.push(new NetworkScanner({ version: 1 }))
    newGateway.storage.files.push(new NetworkScanner({ version: 10 }))
    newGateway.storage.files.push(new PasswordCracker({ version: 1 }))
    newGateway.storage.files.push(new PasswordCracker({ version: 10 }))

    return newGateway
}