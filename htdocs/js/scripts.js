var setup = require('./setup.js');
var functions = require('./functions.js');

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application({
    autoResize: true,
    resolution: devicePixelRatio,
    width: window.innerWidth,
    height: window.innerHeight
});
document.querySelector('#frame').appendChild(app.view);

// Variables.
let player;
let allPlayers = [];
var socket = io();
let username = "";

let wKey = functions.keyboard('w');
let aKey = functions.keyboard('a');
let sKey = functions.keyboard('s');
let dKey = functions.keyboard('d');

// The application will create a canvas element for you that you
// can then insert into the DOM
// load the texture we need
PIXI.loader
.add('bunny', 'images/bunny.png')
.load((loader, resources) => {

    // This creates a texture from a 'bunny.png' image
    player = new PIXI.Sprite(resources.bunny.texture);

    // Setup the position of the bunny
    player.x = app.renderer.screen.width / 2;
    player.y = app.renderer.screen.height / 2;

    // Rotate around the center
    player.anchor.x = 0.5;
    player.anchor.y = 0.5;

    // Add the bunny to the scene we are building
    app.stage.addChild(player);

    // Listen for frame updates
    app.ticker.add(() => {
        if (wKey.isDown && player.y >= 0) { player.y -= 10; }
        if (sKey.isDown && player.y <= window.innerWidth) { player.y += 10; }

        if (aKey.isDown && player.y >= 0) { player.x -= 10; }
        if (dKey.isDown && player.y <= window.innerHeight) { player.x += 10; }

        if (wKey.isDown || sKey.isDown || aKey.isDown || dKey.isDown) {
            var data = { x: player.x, y: player.y, username: username };
            socket.emit('playerMovementSent', data); 
        }
    });

    $("#join form").submit(function(e) {
        e.preventDefault();
        socket.emit('userJoinSent', $("#join #username").val());
        username = $("#join #username").val();
        $("#join #username").val('');
    });


    socket.on('playerMovementUpdate', function(playerObj) {
        if (typeof allPlayers[playerObj.username] != "undefined") {
            allPlayers[playerObj.username].x = playerObj.x;
            allPlayers[playerObj.username].y = playerObj.y;
        }
    }); 

    socket.on('userJoinUpdate', function(playersObj) {
        for (let key in playersObj) {
            let username = playersObj[key].username;
            if (typeof allPlayers[username] == "undefined") {
                let newPlayer = new PIXI.Sprite(resources.bunny.texture);
                newPlayer.x = app.renderer.screen.width / 2;
                newPlayer.y = app.renderer.screen.height / 2;
                newPlayer.anchor.x = 0.5;
                newPlayer.anchor.y = 0.5;
                app.stage.addChild(newPlayer);
                
                allPlayers[username] = newPlayer;
            }
        }

    }); 
});