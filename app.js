// Config
const express = require('express');
const app = express();
const port = 5640;
var http = require("http").Server(app);
var io = require("socket.io")(http);

// objects
const Player = require("./models/Player.js");

app.use(express.static('htdocs'));

app.get('/', (req, res) => res.send('God is in the hack!'));


io.on("connection", (socket) => {
    console.log("a user has connected");
    socket.on("disconnect", () => {
        console.log("A user has disconnected");
    });
});

http.listen(port, () => {
    // DON'T REMOVE THIS
    console.log("God is in the house");
}); 

