class Player {
    constructor(username) {
        this.username = username;
    }
    set movement(data) {
        this._x = data.x;
        this._y = data.y;
    }

    get movement() {
        return [this._x, this._y];
    }
}

module.exports = Player;