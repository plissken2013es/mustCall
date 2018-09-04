"use strict";

/**
 * User sessions
 * @param {Array} users
 */
const users = {};
const dummy = [
    {s: 25, n: "Zane"},
    {s: 120, n: "Drew"},
    {s: 150, n: "Faris"},
    {s: 65, n: "Dante"},
    {s: 200, n: "Lucy"},
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

function prettyTime(seconds) {
    let minutes = (seconds / 60) | 0;
    seconds = seconds - (minutes * 60);
    return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
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
            socket.broadcast.emit("new", name);
            console.log(users);
		});
        
        socket.on("scores", () => {
            console.log("storage size", storage.size());
            storage.get("scores", dummy).then(s => {
                console.log("emitting scores", s);
                socket.emit("scores", s);
            });
        });
        
        socket.on("beat", (h)=>{
            console.log("new highscore!!", h);
            socket.broadcast.emit("beat", h);
            storage.get("scores", dummy).then(s => {
                s.push(h);
                s.slice(0,149);
                storage.set("scores", s).then((ok)=>{
                    console.log("storage updated", ok);
                    io.emit("scores", s);
                });
            });
        });

		console.log("Connected: " + socket.id);
	},

	stat: (req, res) => {
		storage.get("scores", dummy).then(sc => {
            sc = sc.sort((a, b)=>{
                return a.s < b.s ? 1 : (a.s > b.s ? -1 : 0);
            });
            var h = "<h1>High scores</h1>";
            sc.forEach((s, i)=>{
                h += "<p>" + (i+1) + ". " + s.n + " - " + prettyTime(s.s) + "</p>";
            });
			res.send(h);
		});
	}

};