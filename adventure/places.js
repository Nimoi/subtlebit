const {getRandomItem} = require('./random.js');

class Place {
    constructor() {
        this.names = [
            'City',
            'Village',
            'Swamp',
            'Mountains',
            'Mines',
            'Forest',
            'Sewers'
        ];
    }

    random() {
        return getRandomItem(this.names);
    }
}

exports.Place = Place;
