const {getRandomItem, getRandomInt} = require('./random.js');
const fs = require('fs');

var getRandomWord = exports.getRandomWord = () => {
    const lines = fs.readFileSync('./dictionary.txt').split('\n');
    return lines[Math.floor(Math.random() * lines.length)];
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
    return generateItem(
        getRandomItem(
            Object.keys(getGearSlots())
        )
    );
}

exports.generateItemBySlot = (slot) => {
    return generateItem(slot)['item'];
}

function generateItem(slot) {
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
    return {
        slot: slot,
        item: {
            name: name,
            stat: getStatScore(randomWord) + bonus,
            slot: slot
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
