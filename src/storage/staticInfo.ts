import faker from 'faker'
import { Gateway } from "../server/core/gateway";
import { GatewayStore } from "./gateway-store";
import { PlayerStore } from "./player-store";
import { Player } from "../server/core/owner";
import { File } from '../server/core/resource'
import { PasswordCracker } from '../server/core/process';

export async function generateGateways() {
    GatewayStore.clear()

    for (let i = 0; i < 10; i++) {
        const gateway = new Gateway({ hostname: `${faker.company.companyName()} ${faker.company.companySuffix()}` })
        gateway.users!.push({ userName: 'root', password: faker.random.word() })

        GatewayStore.saveGateway(gateway)
    }
}

export async function generatePlayers() {
    PlayerStore.clear()
    const player = new Player('Leandro', 'alze')
    player.gateway = new Gateway({ hostname: 'alze-gateway' })
    player.gateway.storage.files.push(new PasswordCracker({ name: 'Password Cracker', size: 100 }))

    PlayerStore.savePlayer(player)
    GatewayStore.saveGateway(player.gateway)

    const player2 = new Player('Hanoi', 'hanoi')
    player2.gateway = new Gateway({ hostname: 'hanoi-gateway' })
    player2.gateway.storage.files.push(new PasswordCracker({ name: 'Password Cracker', size: 100 }))

    PlayerStore.savePlayer(player2)
    GatewayStore.saveGateway(player2.gateway)
}