const {getRandomItem, getRandomInt} = require('./random.js');
const fs = require('fs');

var getRandomWord = exports.getRandomWord = () => {
    const file = fs.readFileSync(__dirname+'/dictionary.txt', 'utf-8');
    const lines = file.split('\n');
    const line = lines[Math.floor(Math.random() * lines.length)];
    return capitalizeFirstLetter(line);
}

var getGearSlots = exports.getGearSlots = () => {
    return {
        weapon: [
            'sword',
            'bow',
            'lance',
            'katana',
            'bayonet',
            'club',
            'dagger',
            'halberd',
            'lance',
            'pike',
            'quarterstaff',
            'sabre',
            'tomahawk',
            'spear',
            'sling',
            'boomerang'
        ],
        head: [
            'helmet',
            'hood',
            'hat',
            'cap',
            'crown'
        ],
        potion: [
            'potion',
            'flask',
            'elixir',
            'mixture',
            'brew'
        ]
    };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getSlotType(slot) {
    return capitalizeFirstLetter(
        getRandomItem(
            getGearSlots()[slot]
        )
    );
}

exports.generateItemRandom = () => {
    return exports.generateItem(
        getRandomItem(
            Object.keys(getGearSlots())
        )
    );
}

exports.generateItemBySlot = (slot) => {
    return exports.generateItem(slot)['item'];
}

exports.generateItem = (slot, level = 1) => {
    let name = '';
    let bonusWord = getRandomWord();
    let bonus = getRandomInt(0,10) === 5 ? getStatScore(bonusWord) : 0;
    if (bonus) {
        name +=  bonusWord + ' ';
    }
    name += getSlotType(slot);
    name += ' of ';
    if (getRandomInt(0,1)) {
        name += 'the ';
    }
    let randomWord = getRandomWord();
    name += randomWord;
    let statBonus = Math.ceil((getStatScore(randomWord) + bonus) * 0.2);
    let itemLevel = getRandomInt(level - 2, level + 2);
    if (itemLevel < 1) {
        itemLevel = 1;
    }
    let stat = statBonus + itemLevel;
    return {
        slot: slot,
        item: {
            name: name,
            stat: stat,
            slot: slot,
            level: itemLevel
        }
    };
}

function getStatScore(word) {
    let stat = word.length;
    for (let bonusWord in bonusWords()) {
        if (word.includes(bonusWord) !== false) {
            stat += 10;
        }
    }
    return stat;
}

function bonusWords() {
    return [
        'gunt',
        'ranch',
        'brew',
        'labat',
        'laker'
    ];
}
