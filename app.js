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
        console.log("A user has disconnected");
    });

    socket.on('userJoinSent', (data) => {
        socket.username = data;
        socket.join('room 1', () => {
            // get all clients of room 1
            var clients = io.sockets.adapter.rooms['room 1'].sockets;
            // printing all players in room 1
            for (var clientID in clients) {
                var clientSocket = io.sockets.connected[clientID];
                console.log(clientSocket.username);
            }
        });

        // instantiate player
        var player = new Player();
        player.username = data;
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

