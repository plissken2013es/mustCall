"use strict";

/**
 * User sessions
 * @param {Array} users
 */
const users = {};

/**
 * Remove user session
 * @param {User} user
 */
function removeUser(id) {
	if (users[id]) delete users[id];
    console.log(users);
}

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {

	io: (socket) => {
		socket.on("disconnect", () => {
			console.log("Disconnected: " + socket.id);
			removeUser(socket.id);
		});
        
        socket.on("login", (name) => {
			console.log("Name for", socket.id, ":", name);
			users[socket.id] = {n: name, s: 0};
            console.log(users);
		});

		console.log("Connected: " + socket.id);
	},

	stat: (req, res) => {
		storage.get('games', 0).then(games => {
			res.send(`<h1>Games played: ${games}</h1>`);
		});
	}

};