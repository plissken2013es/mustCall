"use strict";

/**
 * User sessions
 * @param {Array} users
 */
const users = {};
const dummy = [
    {s: 25, n: "Zane"},
    {s: 105, n: "Adele"},
    {s: 120, n: "Drew"},
    {s: 45, n: "Monica"},
    {s: 150, n: "Faris"},
    {s: 65, n: "Dante"},
    {s: 180, n: "Lukas"},
    {s: 85, n: "Bodhi"},
    {s: 200, n: "Lucy"},
    {s: 10, n: "Noob"},
    {s: 95, n: "Bobby"}
];

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
        console.log("storage size", storage.size());
        if (storage.size() <= 0) {
            storage.set("scores", dummy).then((s)=>{
                console.log("storage set", s); 
            });
        }
        
        socket.on("clear", ()=>{
            storage.clear().then(()=>{
                console.log("DB cleared");
            });
        });
        
		socket.on("disconnect", () => {
			console.log("Disconnected: " + socket.id);
			removeUser(socket.id);
		});
        
        socket.on("login", (name) => {
			console.log("Name for", socket.id, ":", name);
			users[socket.id] = {n: name, s: 0};
            // sending to all clients except sender
            socket.broadcast.emit("newUser", name);
            console.log(users);
		});
        
        socket.on("scores", () => {
            console.log("storage size", storage.size);
            storage.get("scores", dummy).then(s => {
                console.log("emitting scores", s);
                socket.emit("scores", s);
            });
        });

		console.log("Connected: " + socket.id);
	}

};