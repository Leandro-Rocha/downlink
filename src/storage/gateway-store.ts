import { Gateway } from "../server/core/gateway"

export class GatewayStore {
    private static ready = false
    private static gatewayMap = new Map<string, Gateway>()

    static getGatewayByIp(ip: string) {
        return GatewayStore.getAll().find(g => g.ip === ip)
    }

    static getGatewayListByIp(...ips: string[]) {
        const result: Gateway[] = []

        for (const ip of ips) {
            const gateway = [...GatewayStore.gatewayMap.values()].find(g => g.ip === ip)
            if (gateway !== undefined)
                result.push(gateway)
        }

        return result
    }

    static getGatewayList(...ids: string[]) {
        const result: Gateway[] = []

        for (const id of ids) {
            const gateway = GatewayStore.getGateway(id)
            if (gateway !== undefined)
                result.push(gateway)
        }

        return result
    }

    static getGateway(id: string): Gateway | undefined {
        return GatewayStore.gatewayMap.get(id)
    }

    static getAll() {
        return [...GatewayStore.gatewayMap.values()]
    }

    static saveGateway(gateway: Gateway) {
        GatewayStore.gatewayMap.set(gateway.id, gateway)
        // await (await GatewayStore.getStorage()).setItem(gateway.id, gateway)
    }

    static clear() {
        GatewayStore.gatewayMap = new Map<string, Gateway>()
    }
}
