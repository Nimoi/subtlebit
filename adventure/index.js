const {Records} = require(__dirname+'/records.js');
//const Mining = require('./mining.js');
//const WoodCutting = require('./woodcutting.js');
const {Place} = require('./places.js');
const {getRandomWord, generateItemBySlot, generateItemRandom} = require('./item.js');
const {Color} = require('./colors.js');
const {Enemy} = require('./enemies.js');
const {getRandomInt, getRandomItem} = require('./random.js');
const markov = require('../markov.js');
const {Trap} = require('./trap.js');
const {Boon} = require('./boon.js');

/**
 * ADVENTURE
 * Have yourself an adventure
 */

/* Ideas
 * - Enemy level ranges
 * - Biome level ranges
 */

function getLevels() {
    var levels = [];
    var step = 80;
    levels[0] = 0;
    levels[1] = 0;
    levels[2] = step;
    for (let i = 3; i < 100; i++) {
        step = step * 1.1;
        levels[i] = levels[i - 1] + step;
    }
    return levels;
}

exports.haveAnAdventure = async (client, target, text, context, sockets) => {
    let adventure = new Adventure(client, target, text, context, sockets);
    await adventure.initialize();
}

class Adventure
{
    constructor(client, target, text, context, sockets) {
        this.client = client;
        this.target = target;
        this.text = text;
        this.context = context;
        this.sockets = sockets;

        this.user;
        this.userTokens;
        this.input;
        this.player;
        this.health = 3;
        this.losePoints = 3;
        this.tokens = 0;

        this.commands = [
            'score',
            'inventory',
            'test',
            'stats',
            'help',
            'commands',
            'sell',
            'potion',
            'drink',
            'redeem',
            'mining',
            'woodcutting'
        ];

        this.user = context.username;
        this.input = text;
        this.messages = [];
        this.sayQueue();
        console.log(
            text,
            context
        );
    }

    async initialize() {
        this.records = new Records(this.user);
        this.record = await this.records.initialize();
        this.player = typeof this.record === 'string'
            ? JSON.parse(this.record)
            : this.record;
        console.log(
            this.player,
        );
        this.setupPlayer();
        this.begin();
    }

    setupPlayer() {
        if (! this.player) {
            return setTimeout(() => {
                this.setupPlayer();
            }, 1000);
        }
        this.player.stats = {
            attack: this.player['gear']['weapon'] === null
                ? 3
                : this.player['gear']['weapon']['stat'],
            defense: this.player['gear']['head'] === null
                ? 3
                : this.player['gear']['head']['stat']
        };
        if (! this.player['experience']) {
            this.player['experience'] = 0;
        }
        if (! this.player['level']) {
            this.player['level'] = 1;
        }
        if (! this.player['health']) {
            this.player['health'] = 100;
        }
    }

    socketAdventure() {
        let enemy = this.getRandomEnemy();
        let battleResults = this.simulateBattle(enemy);
        let item = this.getItemChance();
        let decideTakeItem = item ? this.decideTakeItem(item) : false;

        this.sockets.io.emit('adventure', {
            username: this.user,
            levels: getLevels(),
            context: this.context,
            record: this.player,
            boon: (new Boon).random(),
            trap: (new Trap).random(),
            enemy: enemy,
            sentence: markov.randomSentence(),
            place: {
                type: (new Place).random(),
                name: getRandomWord()
            },
            battle: battleResults,
            item: item,
            decideTakeItem: decideTakeItem
        });

        if (this.player.health <= 0) {
            this.player = this.records.getFreshPlayer();
            this.records.savePlayer(this.player);
            return;
        }
    }

    getItemChance() {
        if (Math.random() > 0.5) {
            return false;
        }
        let slot = getRandomItem(['head', 'weapon', 'potion']);
        return {slot: slot, item: generateItemBySlot(slot)};
    }

    decideTakeItem(data) {
        if (this.compareNewGear(data.slot, data.item)) {
            this.player.gear[data.slot] = data.item;
            this.records.savePlayer(this.player);
            return true;
        }
        return false;
    }

    simulateBattle(enemy) {
        let rounds = getRandomInt(10, 20);
        let log = [];
        let playerTotal = 0;
        let enemyTotal = 0;
        for (let i = 0; i < rounds; i++) {
            let playerAttack = 
                Math.max(this.player.stats.attack - (enemy.stats.defense / 2) + getRandomInt(-5, 5), 0);
            let enemyAttack = 
                Math.max(enemy.stats.attack - (this.player.stats.defense) + getRandomInt(-5, 5), 0);

            log.push({
                playerAttack: playerAttack,
                enemyAttack: enemyAttack
            });

            enemy.health -= playerAttack;
            this.player.health -= enemyAttack;

            playerTotal += playerAttack;
            enemyTotal += enemyAttack;

            if (enemy.health < 1 || this.player.health < 1) {
                break;
            }
        }
        let experience = this.player.health > 0 ? enemy.level * 4 : 0;
        this.addExperience(experience);
        this.records.savePlayer(this.player);
        return {
            log: log,
            experience: experience, 
            playerTotal: playerTotal,
            enemyTotal: enemyTotal
        };
    }

    addExperience(experience) {
        // Update player experience total and calculate level
        this.player.experience += experience;
        let newLevel = this.calculateLevel();
        if (newLevel === this.player.level) {
            return;
        }
        this.player.health = 100;
        this.player.level = newLevel;
    }

    calculateLevel() {
        let levels = getLevels();
        // Filter levels on XP, get the last index
        return levels.filter((experience) => {
            return experience < this.player.experience;
        }).length - 1;
    }

    begin() {
        let command = this.isInputACommand()
        console.log(command);
        if (command) {
            return this[command]();
        }
        //this.randomEvent();
        this.socketAdventure();
    }

    randomEvent() {
        this.say(this.adventureStartMessage());
        let random = Math.random();
        if (random < 0.25) {
            return this.trap();
        }
        if (random < 0.5) {
            return this.boon();
        }
        return this.fight();
    }

    trap() {
        let trap = (new Trap).random();
        this.player['health'] -= trap.damage;
        this.records.savePlayer(this.player);
        this.say('You '+trap.verb+' '+trap.name+'!');
        this.say('You lost ☠️'+trap.damage+' HP.');
    }

    boon() {
        let boon = (new Boon).random();
        this.player['health'] += boon.health;
        this.records.savePlayer(this.player);
        this.say('You '+boon.verb+' '+boon.name+'!');
        this.say('You gained ❤️'+boon.health+' HP.');
    }

    adventureStartMessage() {
        let adventureStart = ''+this.user+' ';
        adventureStart += '(❤️'+this.player['health']+') ';
        let place = (new Place).random();
        adventureStart += 'travels to the '+place+' of '+getRandomWord() + '. ';
        return adventureStart;
    }

    getTimesAdventured() {
        return this.player['wins'] + this.player['losses'] + 1;
    }

    isInputACommand() {
        return this.commands.find((command) => {
            return this.input.trim().substr(0, command.length) === command
        });
    }

    drink() {
        return this.potion();
    }

    potion() {
        let potion = this.player['gear']['potion'];
        if (potion === null) {
            this.say('You do not have any potions.');
            return;
        }
        this.player['health'] += potion['stat'];
        this.player['gear']['potion'] = null;
        this.records.savePlayer(this.player);
        this.say(this.user+' drank their '+potion['name']+' and gained (❤️'+potion['stat']+') health.');
    }

    sell() {
        let params = this.input.trim().substr('sell'.length).trim();
        if (! params) {
            this.say('Sell your items with !adventure sell [ITEM]');
            return;
        }
        // Check if item is a slot
        let weaponNames = ['weapon', 'sword'];
        let headNames = ['head', 'hat', 'helmet', 'helm'];
        let potionNames = ['potion', 'elixir', 'flask'];

        let isWeaponSlot = params.indexOf(weaponNames) !== -1 ? 'weapon' : false;
        let isHeadSlot = params.indexOf(headNames) !== -1 ? 'head' : false;
        let isPotionSlot = params.indexOf(potionNames) !== -1 ? 'potion' : false;
        
        let item;
        if (isWeaponSlot) {
            item = this.player['gear'][isWeaponSlot];
        } else if (isHeadSlot) {
            item = this.player['gear'][isHeadSlot];
        } else if (isPotionSlot) {
            item = this.player['gear'][isPotionSlot];
        } else {
            // Check if item is named
            let itemSlot = Object.keys(this.player.gear).find((slot) => {
                let item = this.player.gear[slot];
                if (item === null) {
                    return false;
                }
                return item['name'].toLowerCase() == params.toLowerCase();
            });
            if (itemSlot) {
                item = this.player.gear[itemSlot];
            }
        }
        if (item === null || item === undefined) {
            this.say('You don\'t appear to have any '+params+'.');
            return;
        }
        this.player['sold'] = item;
        this.player['gear'][item['slot']] = null;
        if (! this.player.currency) {
            this.player.currency = 0;
        }
        let price = item.stat * 10;
        this.player.currency += price;
        this.records.savePlayer(this.player);
        this.say(this.user+' sold their '+item.name+' for $'+price+'.');
    }

    compareNewGear(slot, item) {
        let currentGear = this.player['gear'][slot];
        return currentGear === null
            || currentGear['stat'] < item['stat'];
    }

    inventory() {
        let hasGear = Object.keys(this.player.gear).filter((slot) => {
            return this.player.gear[slot] !== null;
        }).length > 0;
        if (! hasGear) {
            this.say(this.user + ' has no gear. Try having some !adventure');
            return;
        }

        let itemValues = Object.keys(this.player.gear).filter((slot) => {
            return this.player.gear[slot] !== null;
        }).map((slot) => {
            let item = this.player.gear[slot];
            item.value = item.stat * 10;
            return this.getItemName(item) + ' $'+item.value;
        });
        // TODO: fix
        //})->sortByDesc('slot')->map(function (item) {
            //item['value'] = item['stat'] * 10;
            //return this.getItemName(item) . ' $'.item['value'];
        //});

        let message = this.user + '\'s inventory: ';
        message += itemValues.join(', ');
        //message .= '. Try !adventure sell <item>';
        this.say(message);
    }

    stats() {
        let message = this.user + '\'s stats: ';
        message += '💗'+this.player['health']+', ';
        message += '⚔️'+this.player['stats']['attack']+', ';
        message += '🛡️'+this.player['stats']['defense']+', ';
        message += ''+this.player['experience']+' XP.';
        this.say(message);
    }

    getItemName(item) {
        let icon = '🛡️';
        if (item['slot'] === 'weapon') {
            icon = '⚔️';
        }
        if (item['slot'] === 'potion') {
            icon = '💗';
        }
        return item['name'] + ' ('+icon+item['stat']+')';
    }

    fight() {
        let enemy = this.getRandomEnemy();
        let win = this.battle(this.player['stats'], enemy['stats']);
        //let wordStartsWithVowel = this.wordStartsVowel(enemy['type']);
        //response = wordStartsWithVowel ? 'An' : 'A';
        let response = enemy['name']+' the '+enemy['type'];
        response += ' (⚔️'+enemy['stats']['attack']+', 🛡️'+enemy['stats']['defense']+')';
        response += ' attacks!';
        response += ' It shouts at you, "'+markov.randomSentence()+'"!';
        this.say(response + this.damagePlayer(enemy));
        let experience = 0;
        if (this.player['health'] <= 0) {
            this.say(this.user+' has died!');
            this.player = this.records.getFreshPlayer();
            this.records.savePlayer(this.player);
            return;
        }
        response = '';
        if (win) {
            this.player['wins']++;
            experience = enemy['stats']['defense'] * 10;
            response += ' You defeated it';
            if (! this.player['gear']['weapon']) {
                response += ' with your '+this.getItemName(this.player['gear']['weapon']);
            }
            response += '!';
            if (enemy['gear']['head']) {
                response = this.takeItOrLeaveIt(response, 'head', enemy['gear']['head']);
            }
            if (enemy['gear']['weapon']) {
                response = this.takeItOrLeaveIt(response, 'weapon', enemy['gear']['weapon']);
            }
            if (enemy['gear']['potion']) {
                response = this.takeItOrLeaveIt(response, 'potion', enemy['gear']['potion']);
            }
        } else {
            this.player['losses']++;
            experience = enemy['stats']['attack'];
            response += ' It tore you up but you managed to escape.';
        }
        this.player['experience'] = (parseFloat(experience) + parseFloat(this.player['experience'])).toFixed(2);
        this.records.savePlayer(this.player);
        response += '. You earned '+experience+'XP.';
        this.say(response);
    }

    damagePlayer(enemy) {
        let damage = enemy['stats']['attack'] - this.player['stats']['defense'];
        if (damage <= 0) {
            //return ' You takes no damage.';
            return '';
        }
        this.player['health'] -= damage;
        return ' You lost ☠️'+damage+ ' HP.';
    }

    wordStartsVowel(word) {
        let vowels = ['a','e','i','o','u'];
        let firstLetterOfWord = word.substr(0, 1).toLowerCase();
        return vowels.indexOf(firstLetterOfWord) !== -1;
    }

    battle(player, enemy) {
        // FORMULA = ([userdef] - [enematk]) - ([enemdef] - [useratk])
        return (player['defense'] - enemy['attack']) - (enemy['defense'] - player['attack']);
    }

    takeItOrLeaveIt(response, slot, item) {
        if (response.indexOf('Dropped: ') === -1) {
            response += ' Dropped: '+this.getItemName(item);
        } else {
            response += ' Also dropped: '+this.getItemName(item);
        }
        if (this.compareNewGear(slot, item)) {
            this.player['gear'][slot] = item;
            this.records.savePlayer(this.player);
            response += ' You take it.';
        } else {
            response += '';
        }
        return response;
    }

    getRandomEnemy() {
        let color = (new Color()).random();
        let enemy = (new Enemy()).random();
        let gear = {
            head: getRandomInt(0,5) === 5 ? null : generateItemBySlot('head'),
            weapon: getRandomInt(0,5) === 5 ? null : generateItemBySlot('weapon'),
            potion: getRandomInt(0,5) === 5 ? null : generateItemBySlot('potion'),
        };
        let level = getRandomInt(this.player.level, this.player.level + 5);
        // You defeated X with your Y. 
        // (depending on how much damage positive / negative score:) It was a critical hit! Devastating, etc
        let attack = level * getRandomInt(1, 3);
        let multipliers = [
            0.25,
            0.5,
            0.75,
            1.0,
            1.25,
            1.5,
            1.75
        ];
        let defense = attack * multipliers[getRandomInt(0, multipliers.length - 1)];
        return {
            health: 100,
            level: level,
            color: color,
            type: enemy,
            name: getRandomWord(),
            gear: gear,
            stats: {
                attack: attack,
                defense: defense
            }
        };
    }

    /*
    mining() {
        return (new Mining(
            this.user,
            this.input,
            this.userTokens,
            this.player
        )).begin();
    }

    woodcutting() {
        return (new WoodCutting(
            this.user,
            this.input,
            this.userTokens,
            this.player
        )).begin();
    }
    */

    help() {
        this.say('Go on an adventure here in this chat. Earn some XP. Find some loot. Get dead maybe too? Try !adventure commands');
    }

    commands() {
        this.say('!adventure - go on an adventure, !adventure potion - drink your potion, !adventure inventory - check your gear, !adventure sell - sell your gear, !adventure help - learn more');
    }

    say(message) {
        this.messages.push(message);
    }

    sayQueue() {
        setInterval(() => {
            if (this.messages.length) {
                this.client.say(this.target, '/me '+this.messages.shift());
                //console.log(this.messages.shift(), Date.now());
            }
        }, 1500);
    }
}
