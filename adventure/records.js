const fs = require('fs');

class Records
{
    constructor(user)
    {
        this.user = user;
        fs.readdir('records', (err, files) => {
            if (files.indexOf(this.user) === -1) {
                return this.addPlayer();
            }
            return this.getPlayer();
        });
    }

    getPlayerRecord() {
        return this.player;
    }

    getUserFilePath() {
        return 'records/'+this.user;
    }

    getFreshPlayer() {
        return {
            tokens: 0,
            wins: 0,
            losses: 0,
            gear: {
                head: null,
                weapon: null,
                potion: null
            },
            health: 100
        };
    }

    addPlayer() {
        let player = this.getFreshPlayer();
        let path = this.getUserFilePath();
        this.write(path, player);
        return player;
    }

    getPlayer() {
        let path = this.getUserFilePath();
        fs.readFile(path, (err, data) => {
          if (err) throw err;
          this.player = data;
        });
    }

    savePlayer(player) {
        this.write(this.getUserFilePath(), JSON.stringify(player));
    }

    write(path, text) {
        fs.writeFileSync(path, text);
    }
}

exports.default = Records;
