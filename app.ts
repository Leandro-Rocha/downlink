import express from 'express'
import http from 'http'
import consoleStamp from 'console-stamp'
import { generateGateways, generatePlayers } from './src/storage/staticInfo'
import { createSocketHandler } from './src/server/core/socket-handler'

consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' })

const port = 3000

const app = express()
const server = new http.Server(app)

const socketHandler = createSocketHandler({ httpServer: server })
socketHandler.start()

app.use(express.static('public'))
app.use('/client', express.static('out/client/'))
app.use('/common', express.static('out/common/'))

// Source Map
app.use('/src/client', express.static('src/client'))



generateGateways()
generatePlayers()



server.listen(port, () => {
    console.info(`Server up on http:\\\\localhost:${port}`)
})