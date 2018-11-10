class Player {
    constructor() {

    }
    set username(name) {
        this._username = name;
    }
    get username() {
        return this._username;
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