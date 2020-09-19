import { socketEvents } from "../common/constants.js"
import { godMode, playerConnected, updateGameState } from "./client.js"

export const socket = io()

socket.on(socketEvents.CONNECT, () => {
    console.log('Connected to server')
    playerConnected()
})

socket.on(socketEvents.UPDATE_STATE, (newState: any) => updateGameState(newState))
socket.on(socketEvents.GOD_MODE, (newState: any) => godMode(newState))