const {getRandomItem} = require('./random.js');

class Boon {
    constructor() {
        this.boons = [
            {
                verb: 'drink a',
                name: 'Laker Red',
                health: 2
            },
            {
                verb: 'smoke a',
                name: 'Cig',
                health: -1
            },
            {
                verb: 'receive a',
                name: 'Compliment',
                health: 5
            },
            {
                verb: 'don\'t run into any trouble, but you have a',
                name: 'Good Day',
                health: 10
            },
        ];
    }

    random() {
        return getRandomItem(this.boons);
    }
}

exports.Boon = Boon;
