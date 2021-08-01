const Records = require('./records.js');
//const Mining = require('./mining.js');
//const WoodCutting = require('./woodcutting.js');
const Place = require('./places.js');
const {getRandomWord, generateItemBySlot, generateItemRandom} = require('./item.js');
const Color = require('./colors.js');
const Enemy = require('./enemies.js');
const getRandomInt = require('./random.js');

/**
 * Adventure Game
 *
 * Porting over advnture game from ankh. It was a lot of PHP, but this will be different anyway so I am not worried about an identical rewrite.o
 *
 * Key Concepts:
 *
 * - Generate random items and enemies with random names.
 *   - Point values based on the names
 *   - Names pull words from stream dictionary
 *
 * - Generate stream dictionary
 *   - Read message log and find unique words
 *
 * - !adventure
 *   - Go on an adventure
 *   - Battle - "An x has appeared before you. It attacks!"
 *   - Negotiate - "The x have lost 50 y in a flood. Will you offer them z to maintain relations?"
 *   - Encounter - "You approach a suspicious x camping near your path. What do you do?"
 *   
 *   I think basically I generate random situations.
 *   Each one favors a different resolution like attack, negotiate, deceive, or whatever. 
 *   You choose a move and roll on it - if your roll matches the situations expectation for that type of action then you win.
 *
 *   Stats / Actions:
 *
 *   - Constitution : Health
 *   - Strength : Attack: Engage in a battle.
 *   - Persuasion : Negotiate: Argue in your favor.
 *   - Dexterity : Sneak: Stealth your way out of trouble.
 *   - Wisdom : Wits: Think your way out of the problem.
 *   - Haste : Attack speed interval multiplier
 *
 *   "Nimoi ran into Leroy the Hungry Giant (999) but managed to sneak past with 20 tokens!"
 *   "Nimoi was ambushed by The Gang of Gunt but managed to negotiate their freedom and a bonus 5 tokens!"
 *   "Nimoi traveled to the Land of Ranch and encountered Richard the Bossman. They battled and Nimoi was victorious! They found a Flask of Laker Red and decided to take it."
 *
 *   Enemy Stat:
 *
 *   {
 *      Cons: 10
 *      Str: 15
 *      Pers: 8
 *      Dex: 120
 *   }
 *
 *   Player chooses "Sneak", rolls D20 + their Dexterity stat. If it is less than 120, they fail.
 *
 *   If a player chooses to Battle, the battle minigame starts:
 *
 *   - Every 5 seconds (multiplied by players haste) the player will swing at the enemy. The enemy will also attack on their own timer.
 *   - Maybe we'll let the player interact to use a potion or something
 *   - Unlock abilities to use during combat
 *   - Special effect armor like reflects damage or spiked armor
 *
 *   Other Ideas:
 *
 *   - Trade stuff with other players
 *   - Discover PETS!? (Maybe it should just be a pets game)
 *   - Collect resources to craft helpful stuff
 *   - RAID bosses that players team up to fight
 *   - DEATH: Perma or not? Maybe only if you want to be hardcore
 *
 */

//$req_dump = print_r($_REQUEST, TRUE);
//$fp = fopen('request.log', 'a');
//fwrite($fp, $req_dump);
//fclose($fp);

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
 * Items with special abilities (like comes back to you when you die, or unlocks special silly commands)
 * "Talking" Swords. Chance if the weapon is type sword to be a "Talking" sword that says a markov line
 */

//$user = isset($_GET['user']) ? $_GET['user'] : null;
//$tokens = isset($_GET['tokens']) ? intval($_GET['tokens']) : null;
//$input = isset($_GET['input']) ? $_GET['input'] : null;

exports.haveAnAdventure = (client, target, text, context) => {
    console.log(client, target, text, context);
    let adventure = new Adventure(client, target, text, context);
    adventure.begin();
}

class Adventure
{
    constructor(client, target, text, context) {
        this.client = client;
        this.target = target;
        this.text = text;
        this.context = context;

        console.log(
            client,
            target,
            text,
            context
        );

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

        // TODO: fix these
        //this.user = user;
        //this.input = input;
        //this.userTokens = tokens;

        this.records = new Records(this.user);
        this.player = this.records.getPlayerRecord();
        this.player.stats = {
            attack: this.player['gear']['weapon'] === null
                ? 3
                : this.player['gear']['weapon']['stat'],
            defense: this.player['gear']['head'] === null
                ? 3
                : this.player['gear']['head']['stat']
        };
        if (! this.player['gear']['head']) {
            this.player['gear']['head']['slot'] = 'head';
        }
        if (! this.player['gear']['weapon']) {
            this.player['gear']['weapon']['slot'] = 'weapon';
        }
        if (this.player['experience']) {
            this.player['experience'] = 0;
        }
        if (this.player['level']) {
            this.player['level'] = 1;
        }
        if (this.player['health']) {
            this.player['health'] = 100;
        }
    }

    begin() {
        let command = this.isInputACommand()
        if (command) {
            return this[command]();
        }
        return this.fight(this.adventureStartMessage());
    }

    addPoints(
        points, 
        message = 'You earned $value tokens',
        fail = 'You slipped and lost your tokens.'
    ) {
        message += ' ($newbalance($user)).';
        return ' $addpoints("$user","'+points+'","'+points+'","'+message+'","'+fail+'") ';
    }

    removePoints() {
        //return ' $removepoints("$user","'+betDifference+'","'+betDifference+'","You died and lost $value tokens","","false") ';
    }

    adventureStartMessage() {
        let adventureStart = '/me $user ';
        adventureStart += '(❤️'+this.player['health']+') ';
        let place = (new Place).random();
        adventureStart += 'travels to the '+place+' of '+getRandomWord() + '. ';
        return adventureStart;
    }

    getTimesAdventured() {
        return this.player['wins'] + this.player['losses'] + 1;
    }

    isInputACommand() {
        let response = false;
        for (let command in this.commands) {
            if (this.input.substr(0, command.length) === command) {
                response = command;
            }
        }
        return response;
    }

    drink() {
        return this.potion();
    }

    potion() {
        let potion = this.player['gear']['potion'];
        if (potion === null) {
            this.say('/me You do not have any potions.');
        }
        this.player['health'] += potion['stat'];
        this.player['gear']['potion'] = null;
        this.records.savePlayer(this.player);
        this.say('/me $user drank their '+potion['name']+' and gained '+potion['stat']+' health.');
    }

    sell() {
        let params = this.input.substr('sell'.length).trim();
        if (! params) {
            this.say('/me Sell your items with !adventure sell [ITEM]');
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
            this.say('/me You don\'t appear to have any '+params+'.');
            return;
        }
        this.player['sold'] = item;
        this.player['gear'][item['slot']] = null;
        this.records.savePlayer(this.player);
        return this.addPoints(
            item['stat'] * 10,
            '/me $user sold their '+item['name']+' for $value tokens.'
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
            this.say('/me ' + this.user + ' has no gear. Try having some !adventure');
            return;
        }

        let itemValues = this.player['gear'].filter((item) => {
            return item !== null;
        // TODO: fix
        //})->sortByDesc('slot')->map(function (item) {
            //item['value'] = item['stat'] * 10;
            //return this.getItemName(item) . ' $'.item['value'];
        });

        let message = '/me ' + this.user + '\'s inventory: ';
        message += itemValues.join(', ');
        //message .= '. Try !adventure sell <item>';
        this.say(message);
    }

    stats() {
        let message = '/me ' + this.user + '\'s stats: ';
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
        return item['name'] + ' ('+icon.item['stat']+')';
    }

    fight(response) {
        // TODO: build message
        let enemy = this.getRandomEnemy();
        let win = this.battle(this.player['stats'], enemy['stats']);
        //let wordStartsWithVowel = this.wordStartsVowel(enemy['type']);
        //response = wordStartsWithVowel ? 'An' : 'A';
        response += enemy['name']+' the '+enemy['type'];
        response += ' (⚔️'+enemy['stats']['attack']+', 🛡️'+enemy['stats']['defense']+')';
        response += ' attacks!';
        let experience = 0;
        response += this.damagePlayer(enemy);
        if (enemy['gear']['bomb']) {
            let lost = 50;
            response += ' The enemy dropped a bomb! You lost '+lost+' tokens. $removepoints("$user","'+lost+'","'+lost+'","","","false") ';
        }
        if (this.player['health'] <= 0) {
            response += ' $user has died!';
            this.say(response);
            this.player = this.records.getFreshPlayer();
            this.records.savePlayer(this.player);
            return;
        }
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
        this.player['experience'] = (experience + this.player['experience']).toFixed(2);
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
            bomb: getRandomInt(0,3) === 3
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

    test() {
        let response = '';
        for(let i=0; i < 3; i++) {
            let item = generateItemRandom();
            response += this.getItemName(item['item']) + ' ';
        }
        console.log(response);

        console.log(this.player);

        console.log(getRandomWord());
    }

    help() {
        this.say('/me Go on an adventure here in this chat. Earn some XP. Find some loot. Get dead maybe too? Try !adventure commands');
    }

    commands() {
        this.say('/me !adventure - go on an adventure, !adventure potion - drink your potion, !adventure inventory - check your gear, !adventure sell - sell your gear, !adventure help - learn more');
    }

    say(message) {
        this.client.say(this.target, `${message}`);
    }
}

//echo haveAnAdventure(user, tokens, input);
