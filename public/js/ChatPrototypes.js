const ChatControl = function (socket) {
	this.socket = socket
}

ChatControl.prototype.sendMessage = function (room, text) {
	const message = {
		room: room,
		text: text
	}

	this.socket.emit('sendMessage', message)
}

ChatControl.prototype.parseCommand = function (command) {
	let room
	let message
	const words = command.split(' ')
	command = words[0].substring(1, words[0].length).toLowerCase()

	switch (command) {
		case 'nick':
			words.shift()
			this.socket.emit('attemptChangeName', words)
		break;
		default:
			message='Unknown command.'
		break;
	}
}

export { ChatControl }