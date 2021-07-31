import {getRandomItem, getRandomInt} from './random.js';

export function getRandomWord() {
    let f_contents = file(__DIR__ + '/dictionary.txt'); 
    let line = f_contents[rand(0, count(f_contents) - 1)];
    return str_replace(PHP_EOL, '', ucfirst(line));
}

export function getGearSlots() {
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

function getSlotType(slot) {
    return ucfirst(
        getRandomItem(
            getGearSlots()[slot]
        )
    );
}

export function generateItemRandom() {
    return generateItem(
        getRandomItem(
            Object.keys(getGearSlots())
        )
    );
}

export function generateItemBySlot(slot) {
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
    randomWord = getRandomWord();
    name += randomWord;
    return {
        slot: slot,
        item: [
            name: name,
            stat: getStatScore(randomWord) + $bonus,
            slot: slot
        ]
    };
}

function getStatScore(word) {
    let stat = strlen(word);
    foreach(bonusWords() as bonusWord) {
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
