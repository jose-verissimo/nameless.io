// Config
const express = require('express');
const app = express();
const port = 5640;
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require('body-parser')

// objects
const Player = require("./models/Player.js");
let players = {};

app.use(express.static('htdocs'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get('/', (req, res) => res.send('God is in the hack!'));
app.post('/getAllPlayers', (req, res) => res.send(players));
app.post('/checkIfUsernameExists', (req, res) => res.send(checkIfUsernameExists(req.body.username)));

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function checkIfUsernameExists(username) {
    if (!isEmpty(players)) {
        for (let player in players) {
            if (player == username) {
                return true
            } 
        }
    }
    return false;
}

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        if (socket.username) {
            console.log(`${socket.username} has disconnected`);
            for (player in players) {
                if (player == socket.username) {
                    io.emit("userDisconenct", socket.username);
                    delete players[player];
                }
            }

            console.log(players);
        } else {
            console.log("A non registered user has disconnected");
        }

    });

    // params: data is username
    socket.on('userJoinSent', (data) => {
        
        // Check if username already exists.
        if (!isEmpty(players)) {
            for (let player in players) {

                if (player == data) {
                    console.log("Username " + player + " exists L43");
                    io.emit('usernameExists', player);
                    break;
                } else {
                    // instantiate player
                    socket.username = data;
                    console.log(`${socket.username} has joined the room L49`);

                    // Create user.
                    players[socket.username] = new Player(data);
                    io.emit('userJoinUpdate', players[socket.username]);
                    break;
                }
            }
        } else {
            // instantiate player
            socket.username = data;
            console.log(`${socket.username} has joined the room L60`);

            // Create user.
            players[socket.username] = new Player(data);
            io.emit('userJoinUpdate', players[socket.username]);
        }
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

