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
let globalResources;
let allPlayers = [];
var socket = io();

let wKey = functions.keyboard('w');
let aKey = functions.keyboard('a');
let sKey = functions.keyboard('s');
let dKey = functions.keyboard('d');
let spaceKey = functions.keyboard(' ');

// The application will create a canvas element for you that you
// can then insert into the DOM
// load the texture we need
PIXI.loader
.add('bunny', 'assets/lincoln.png')
.load((loader, resources) => {
    globalResources = resources;

    // Add all existing players in the game.
    getAllExistingPlayers();

    $("#join form").submit(function(e) {
        e.preventDefault();
        // Get the username and hide the form.
        let username = $("#join #username").val();

        $.post("/checkIfUsernameExists", { username: username }, function(usernameExists, status) {
            if (!usernameExists) {
                $("#join").css('display', 'none');

                // Create the player.
                player = addPlayerSprite(username); allPlayers[username] = player;
                
                // Emit this event.
                socket.emit('userJoinSent', $("#join #username").val());
        
                // Listen for frame updates
                app.ticker.add(() => {
                    if (wKey.isDown && player.y >= 0) { player.y -= 5; }
                    if (sKey.isDown && player.y <= window.innerWidth) { player.y += 5; }
        
                    if (aKey.isDown && player.y >= 0) { player.x -= 5; }
                    if (dKey.isDown && player.y <= window.innerHeight) { player.x += 5; }
                            
                    if (wKey.isDown || sKey.isDown || aKey.isDown || dKey.isDown) {
                        var data = { x: player.x, y: player.y, username: username };
                        
                        // On movement of the client player.
                        socket.emit('playerMovementSent', data); 
                    }

                    if (spaceKey.isDown) {
                        var graphics = new PIXI.Graphics();
                        graphics.lineStyle(0);
                        graphics.beginFill(0xFFFF0B, 0.5);
                        graphics.drawCircle(470, 90,60);
                        graphics.endFill();

                        app.stage.addChild(graphics);

                    }
                });
            } else {
                alert('The username exists!');
            }
        });

    });

    // Check for movement updates.
    socket.on('playerMovementUpdate', function(playerObj) {
        if (typeof allPlayers[playerObj.username] != "undefined") {
            allPlayers[playerObj.username].x = playerObj.x;
            allPlayers[playerObj.username].y = playerObj.y;
        }
    });

    // Check for user's that join.
    socket.on('userJoinUpdate', function(playerObj) {
        let username = playerObj.username;
        if (typeof allPlayers[username] == "undefined") {
            allPlayers[username] = addPlayerSprite(username);
        }

    }); 

    // Check for user's that join.
    socket.on('usernameExists', function(playerObj) {
        alert('This user name already exists!');
    }); 

    // Check for user disconenction
    socket.on("userDisconenct", function(username) {
        if (typeof allPlayers[username] != "undefined") {
            app.stage.removeChild(allPlayers[username]);
            allPlayers.splice(username, 1); 
        }
    });
});


/**
 * Add player sprites.
 * 
 */
function addPlayerSprite(username) {
    var playerCont = new PIXI.Container();
    playerCont.x = app.renderer.screen.width / 2;
    playerCont.y = app.renderer.screen.height / 2;
    
    // Create player.
    let newPlayer = new PIXI.Sprite(globalResources.bunny.texture);
    newPlayer.x = 0;
    newPlayer.width = 25;
    newPlayer.height = 45;
    newPlayer.y = 0;
    newPlayer.anchor.x = 0.5;
    newPlayer.anchor.y = 0.5;
    playerCont.addChild(newPlayer);
    
    
    // Create text.
    var style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 2,
        wordWrap: true,
        wordWrapWidth: 200
    });
    var richText = new PIXI.Text(username, style);
    richText.x = 0;
    richText.y = -40;
    playerCont.addChild(richText);

    app.stage.addChild(playerCont);

    return playerCont;

}

/**
 * Add all existing players in the game.
 * 
 */
function getAllExistingPlayers() {
    $.post("/getAllPlayers", {}, function(data, status) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                const pData = data[key];
                allPlayers[pData.username] = addPlayerSprite(pData.username);
            }
        }
    });
}