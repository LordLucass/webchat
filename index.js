import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)

const { sockets } = new Server(server)

app.use(express.static(join(__dirname, 'public')))
app.set('views', join(__dirname, 'public'))

app.use('/', (_, res) => res.sender('index.html'))
app.use('/chat', (_, res) => res.sender('index.html'))

import ChatStructure from './public/js/Chat.js'

const Chat = new ChatStructure(server, sockets)

Chat.Start()

server.listen(3000, () => console.log('Server listening on port 3000'))
