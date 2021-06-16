import getRandomInt from './random.js';

export Class Place {
    function random() {
        let max = this.names.length - 1;
        return getRandomItem(this.names);
    }

    const names = [
        'City',
        'Village',
        'Swamp',
        'Mountains',
        'Mines',
        'Forest',
        'Sewers'
    ];
}
