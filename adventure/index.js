const {Records} = require(__dirname+'/records.js');
//const Mining = require('./mining.js');
//const WoodCutting = require('./woodcutting.js');
const {Place} = require('./places.js');
const {getRandomWord, generateItemBySlot, generateItemRandom} = require('./item.js');
const {Color} = require('./colors.js');
const {Enemy} = require('./enemies.js');
const {getRandomInt} = require('./random.js');
const markov = require('../markov.js');
const {Trap} = require('./trap.js');

/**
 * Adventure Game
 *
 *   Other Ideas:
 *
 *   - Trade stuff with other players
 *   - Discover PETS!? (Maybe it should just be a pets game)
 *   - Collect resources to craft helpful stuff
 */

/**
 * ADVENTURE
 * Have yourself an adventure
 */

/* Ideas
 * Shop command to buy weapons / armor from a selection
 * Earn ranks while leveling, unlocking more commands
 * Encourage players to wait a few minutes to prevent spamming the command, fatique or something
 *     Maybe you only have so many adventures and they recharge over time
 * Add a bank command to store the most valuable items (unlocked at level)
 */

exports.haveAnAdventure = async (client, target, text, context) => {
    let adventure = new Adventure(client, target, text, context);
    await adventure.initialize();
}

class Adventure
{
    constructor(client, target, text, context) {
        this.client = client;
        this.target = target;
        this.text = text;
        this.context = context;

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
            typeof this.player
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

    begin() {
        let command = this.isInputACommand()
        console.log(command);
        if (command) {
            return this[command]();
        }
        this.randomEvent();
    }

    randomEvent() {
        this.say(this.adventureStartMessage());
        if (Math.random() < 0.25) {
            return this.trap();
        }
        return this.fight();
    }

    trap() {
        let trap = (new Trap).random();
        this.player['health'] -= trap['damage'];
        this.records.savePlayer(this.player);
        this.say('You '+trap.verb+' '+trap.name+'!');
        this.say('You lost ☠️'+trap.damage+' HP.');
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
        }
        this.player['health'] += potion['stat'];
        this.player['gear']['potion'] = null;
        this.records.savePlayer(this.player);
        this.say(this.user+' drank their '+potion['name']+' and gained (❤️'+potion['stat']+') health.');
    }

    sell() {
        let params = this.input.substr('sell'.length).trim();
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
            item = this.player['gear'].find((item) => {
                return item['name'].toLowerCase() == params.toLowerCase();
            });
        }
        if (item === null) {
            this.say('You don\'t appear to have any '+params+'.');
            return;
        }
        this.player['sold'] = item;
        this.player['gear'][item['slot']] = null;
        this.records.savePlayer(this.player);
        return this.addPoints(
            item['stat'] * 10,
            this.user+' sold their '+item['name']+' for $value tokens.'
        );
    }

    compareNewGear(slot, item) {
        let currentGear = this.player['gear'][slot];
        return currentGear === null
            || currentGear['stat'] < item['stat'];
    }

    inventory() {
        let hasGear = this.player['gear'].filter((gear) => {
            return gear !== null;
        }).length > 0;
        if (! hasGear) {
            this.say(this.user + ' has no gear. Try having some !adventure');
            return;
        }

        let itemValues = this.player['gear'].filter((item) => {
            return item !== null;
        // TODO: fix
        //})->sortByDesc('slot')->map(function (item) {
            //item['value'] = item['stat'] * 10;
            //return this.getItemName(item) . ' $'.item['value'];
        });

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
                response += ' with your '.this.getItemName(this.player['gear']['weapon']);
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
        // attack - strlen(name)
        // defense - attack * [.25, .5, .75, 1, 1.25, 1.5, 1.75]
        // FORMULA = ([userdef] - [enematk]) - ([enemdef] - [useratk])
        // You defeated X with your Y. 
        // (depending on how much damage positive / negative score:) It was a critical hit! Devastating, etc
        let attack = enemy.length + (this.player['stats']['defense'] * 0.5) + (this.player['stats']['attack'] * 0.5);
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
            color: color,
            type: enemy,
            name: getRandomWord(),
            gear: gear,
            stats: {
                attack: enemy.length + (this.player['stats']['defense'] / 2),
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
