import { Player } from "../server/core/player/player"


export class PlayerStore {
    private static playerMap = new Map<string, Player>()

    static getAll() {
        return [...PlayerStore.playerMap.values()]
    }

    static getPlayerByUsername(userName: string) {
        return PlayerStore.getAll().find(p => p.userName === userName)
    }

    static getPlayerBySocketId(socketId: string) {
        return PlayerStore.getAll().find(p => p.socket.id === socketId)
    }

    static savePlayer(player: Player) {
        PlayerStore.playerMap.set(player.userName, player)
    }

    static clear() {
        PlayerStore.playerMap = new Map<string, Player>()
    }
}
