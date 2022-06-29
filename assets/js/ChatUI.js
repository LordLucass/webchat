import { ChatControl } from './ChatPrototypes.js'

const socket = io.connect()

function processUserInputs(controller, socket) {
	const message = $('send-message').val()
	let systemCommand

	if (message.charAt(0) === '/') {
		systemCommand = controller.parseCommand(message)
		if (systemCommand) {
			$('message').append(divSystemContentElement(systemCommand))
		}
	} else {
		controller.sendMessage($('#room').text(), message)
        $('#message').append(divEscapedContentElement(message))
        $('#message').scrollTop($('#message').prop('scrollHeight'))
	}
	$('#send-message').val('');
}

$(document).ready(() => {
	const Chat = new ChatControl(socket)

	socket.on('usernameUpdate', (status) => {
		let statusMessage
		if (status.code === 200) statusMessage = status.message
		if (status.code === 404) statusMessage = status.message

		$('#message').append(divEscapedContentElement(statusMessage))
	})

	socket.on('userJoined', (info) => {
		$('#room').text(info.room)
		$('#message').append(divEscapedContentElement('You have entered a room!'))
	})

	socket.on('rooms', (rooms) => {
		$('#room-list').empty()
		for (let r in rooms) {
			r = r.substring(0, r.length)
			if (r) $('room-list').append(divEscapedContentElement(r))
		}
	
		$('#room-list div').click(() => {
			Chat.parseCommand('/join', $(this).text())
			$('#send-message').focus()
		})

		setInterval(function () {
			socket.emit('rooms')
		}, 5000)

		$('#send-message').focus()

    	$('#send-form').submit(function () {
        	processUserInputs(Chat, socket);
        	return false;
    	});
	});
})

function divEscapedContentElement (message) {
	return $('<div></div>').text(message)
}

function divSystemContentElement(message) {
    if (message) return $('<div></div>').html('<i>' + JSON.stringify(message) + '</i>')
}