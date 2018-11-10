// Config
const express = require('express');
const app = express();
const port = 5640;
var http = require("http").Server(app);
var io = require("socket.io")(http);

// objects
const Player = require("./models/Player.js");
let players = {};

app.use(express.static('htdocs'));

app.get('/', (req, res) => res.send('God is in the hack!'));


io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        console.log(`${socket.username} has disconnected`);
    });

    // params: data is username
    socket.on('userJoinSent', (data) => {
        // Check if username already exists
        var clients = io.sockets.adapter.rooms['room 1'].sockets;
        for (var clientID in clients) {
            var clientSocket = io.sockets.connected[clientID];
            if (clientSocket.username == data) {
                socket.emmit()
            } else {
                socket.username = data;
                socket.join('room 1', () => {});
            }
        }

        // instantiate player
        var player = new Player(data);
        players[player.username] = player;
        io.emit('userJoinUpdate', player);
    });

    socket.on('playerMovementSent', (data) => {
        console.log(players)
        if (typeof players[data.username] != "undefined") {
            players[data.username].x = data.x;
            players[data.username].y = data.y;

            io.emit('playerMovementUpdate', players[data.username]);
        }
    });

});

http.listen(port, () => {
    // DON'T REMOVE THIS
    console.log("God is in the house");
}); 

