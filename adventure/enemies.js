const getRandomItem = require('./random.js');

class Enemy {
    constructor() {
        this.names = [
            'Bandit',
            'Alien',
            'Rogue AI',
            'Bogeyman',
            'Businessman',
            'Grandma',
            'Adult Toddler',
            'TSA Officer',
            'Crime Lord',
            'Cult Leader',
            'Demon',
            'Fanatic',
            'Liar',
            'Monster',
            'Mummy',
            'Ninja',
            'Ogre',
            'Pirate',
        ];
    }

    random() {
        return getRandomItem(this.names);
    }
}

exports.Enemy = Enemy;
