import getRandomInt from './random.js';

export Class Enemy {
    function random() {
        let max = this.names.length - 1;
        return getRandomItem(this.names);
    }

    const names = [
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
