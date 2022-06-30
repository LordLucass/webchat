export default class Chat {
	constructor(server, sockets) {
		this.server = server
		this.sockets = sockets

		this.usersCount = 1
		this.defaultName = `Anon ${this.usersCount}`
		this.usedNames = []
		this.nicknames = {}
		this.currentRoom = {}
	}

	Start () {
		this.sockets.on('connection', (socket) => {
			this.usersCount = this.assignUsername(socket)
			this.joinRoom(socket, 'General')
			this.sendMessage(socket, this.nicknames)
			this.attemptJoinRoom(socket)

			socket.on('rooms', () => socket.emit('rooms', socket.adapter.rooms))

			this.userDisconnect(socket)
		})
	}

	joinRoom (socket, room) {
		socket.join(room)
		this.currentRoom[socket.id] = room
		socket.emit('userJoined', () => { room: room }) //joinResult

		socket.broadcast.to(room).emit('sendMessage', {
			message: `${this.nicknames[socket.id]} joined the room ${room}!`
		})

		const usersInRoomMessage = (users) => `There are ${users} users currently connected into this session.` 
		let usersNames = [];

		for (let s in socket.sockets) {
			const userSocketID = socket.sockets[s].id
			if (userSocketID != socket.id) usersNames = [...usersNames, this.nicknames[userSocketID]]
		}

		socket.emit('sendMessage', { text: usersInRoomMessage(usersNames.length) })
	}

	attemptJoinRoom (socket) {
		socket.on('joinRoom', (room) => {
			socket.leave(this.currentRoom[socket.id])
			this.joinRoom(socket, room.newRoom)
		})
	}

	sendMessage (socket) {
		socket.on('sendMessage', (message) => {
			socket.broadcast.to(message.room).emit('sendMessage', {
				message: `${this.nicknames[socket.id]}: ${message.text}`
			})
		})
	}


	assignUsername (socket) {
		this.nicknames[socket.id] = this.defaultName
		socket.emit('usernameUpdate', {
			name: this.defaultName,
			code: 200
		})
		this.usedNames = [...this.usedNames, this.defaultName]
		return this.usersCount + 1
	}

	attemptChangeName (socket) {
		socket.on('attemptChangeName', (name) => {
			if (name.indexOf('Anon')) {
				socket.emit('usernameUpdate', {
					code: 404,
					message: 'Your name can\'t be \'Anon\' '
				})
			} else {
				if (this.usedNames.indexOf(name) == -1) {
					const oldName = this.nicknames[socket.id]
					const oldNameIndex = this.usedNames.indexOf(oldName)
					this.usedNames = [...this.usedNames, name]
					this.nicknames[socket.id] = name
					delete usedNames[oldName]
					socket.emit('usernameUpdate', {
						code: 200,
						name: name,
						message: 'Your name has been changed!'
					})
					socket.broadcast.to(currentRoom[socket.id]).emit('sendMessage', {
						text: `${oldName} changed your name to ${name}!`
					})
				} else {
					socket.emit('usernameUpdate', {
						code: 404,
						message: 'That name is already in use by other people!'
					})
				}
			}
		})
	}

	userDisconnect (socket) {
		socket.on('userDisconnected', () => {
			const name = this.usedNames.indexOf(this.nicknames[socket.id])
			delete this.usedNames[name]
			delete this.nicknames[socket.id]
			return true
		})
	}
}