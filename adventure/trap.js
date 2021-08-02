const {getRandomItem} = require('./random.js');

class Trap {
    constructor() {
        this.traps = [
            {
                verb: 'step on a',
                name: 'Bee\'s Nest',
                damage: 1
            },
            {
                verb: 'get caught in an',
                name: 'Ambush',
                damage: 10
            },
            {
                verb: 'get caught in an',
                name: 'Avalanche',
                damage: 20
            },
            {
                verb: 'walk into a',
                name: 'Close Line',
                damage: 2
            },
            {
                verb: 'fall through a',
                name: 'Trap Door',
                damage: 5
            }
        ];
    }

    random() {
        return getRandomItem(this.traps);
    }
}

exports.Trap = Trap;
