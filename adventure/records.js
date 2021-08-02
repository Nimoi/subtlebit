const fs = require('fs');

class Records
{
    constructor(user)
    {
        console.log('construct records!');
        this.user = user;
    }

    async initialize() {
        return new Promise(resolve => {
            fs.readdir(__dirname+'/records', (err, files) => {
                console.log(files);
                if (files.indexOf(this.user) === -1) {
                    return resolve(this.addPlayer());
                }
                return resolve(this.getPlayer());
            });
        });
    }

    getPlayerRecord() {
        console.log('player record', this.player);
        return this.player;
    }

    getUserFilePath() {
        return __dirname+'/records/'+this.user;
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
        this.player = player;
        return this.player;
    }

    getPlayer() {
        let path = this.getUserFilePath();
        this.player = JSON.parse(fs.readFileSync(path));
        return this.player;
    }

    savePlayer(player) {
        this.write(this.getUserFilePath(), JSON.stringify(player));
    }

    write(path, text) {
        fs.writeFileSync(path, JSON.stringify(text));
    }
}

exports.Records = Records;
