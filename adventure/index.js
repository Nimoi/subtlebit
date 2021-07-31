import Records from './records.js';
import Mining from './mining.js';
import WoodCutting from './woodcutting.js';

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

export function haveAnAdventure(client, target, text, context) {
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
            attack: empty(this.player['gear']['weapon'])
                ? 3
                : this.player['gear']['weapon']['stat'],
            defense: empty(this.player['gear']['head'])
                ? 3
                : this.player['gear']['head']['stat']
        };
        if (! empty(this.player['gear']['head'])) {
            this.player['gear']['head']['slot'] = 'head';
        }
        if (! empty(this.player['gear']['weapon'])) {
            this.player['gear']['weapon']['slot'] = 'weapon';
        }
        if (empty(this.player['experience'])) {
            this.player['experience'] = 0;
        }
        if (empty(this.player['level'])) {
            this.player['level'] = 1;
        }
        if (empty(this.player['health'])) {
            this.player['health'] = 100;
        }
    }

    begin() {
        if (command = this.isInputACommand()) {
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
        return ' $removepoints("$user","'+betDifference+'","'+betDifference+'","You died and lost $value tokens","","false") ';
    }

    adventureStartMessage() {
        let adventureStart = '/me $user ';
        adventureStart += '(❤️'+this.player['health']+') ';
        place = (new Place).random();
        adventureStart += 'travels to the '+place+' of '+getRandomWord() + '. ';
        return adventureStart;
    }

    getTimesAdventured() {
        return this.player['wins'] + this.player['losses'] + 1;
    }

    isInputACommand() {
        response = false;
        for (let command in this.commands) {
            if (substr(this.input, 0, strlen(command)) === command) {
                response = command;
            }
        }
        return response;
    }

    drink() {
        return this.potion();
    }

    potion() {
        potion = this.player['gear']['potion'];
        if (potion === null) {
            this.say('/me You do not have any potions.');
        }
        this.player['health'] += potion['stat'];
        this.player['gear']['potion'] = null;
        this.records.savePlayer(this.player);
        this.say('/me $user drank their '+potion['name']+' and gained '+potion['stat']+' health.');
    }

    sell() {
        params = trim(substr(this.input, strlen('sell')));
        if (! params) {
            this.say('/me Sell your items with !adventure sell [ITEM]');
            return;
        }
        // Check if item is a slot
        weaponNames = ['weapon', 'sword'];
        headNames = ['head', 'hat', 'helmet', 'helm'];
        potionNames = ['potion', 'elixir', 'flask'];

        isWeaponSlot = in_array(params, weaponNames) ? 'weapon' : false;
        isHeadSlot = in_array(params, headNames) ? 'head' : false;
        isPotionSlot = in_array(params, potionNames) ? 'potion' : false;
        
        if (isWeaponSlot) {
            item = this.player['gear'][isWeaponSlot];
        } else if (isHeadSlot) {
            item = this.player['gear'][isHeadSlot];
        } else if (isPotionSlot) {
            item = this.player['gear'][isPotionSlot];
        } else {
            // Check if item is named
            item = this.player['gear'].find((item) => {
                return strtolower(item['name']) == strtolower(params);
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
        currentGear = this.player['gear'][slot];
        return currentGear === null
            || currentGear['stat'] < item['stat'];
    }

    inventory() {
        hasGear = this.player['gear'].filter((gear) => {
            return gear !== null;
        }).length > 0;
        if (! hasGear) {
            this.say('/me ' + this.user + ' has no gear. Try having some !adventure');
            return;
        }

        itemValues = this.player['gear'].filter((item) => {
            return item !== null;
        // TODO: fix
        //})->sortByDesc('slot')->map(function (item) {
            //item['value'] = item['stat'] * 10;
            //return this.getItemName(item) . ' $'.item['value'];
        });

        message = '/me ' + this.user + '\'s inventory: ';
        message += implode(', ', itemValues);
        //message .= '. Try !adventure sell <item>';
        this.say(message);
    }

    stats() {
        message = '/me ' + this.user + '\'s stats: ';
        message += '💗'+this.player['health']+', ';
        message += '⚔️'+this.player['stats']['attack']+', ';
        message += '🛡️'+this.player['stats']['defense']+', ';
        message += ''+this.player['experience']+' XP.';
        this.say(message);
    }

    getItemName(item) {
        icon = '🛡️';
        if (item['slot'] === 'weapon') {
            icon = '⚔️';
        }
        if (item['slot'] === 'potion') {
            icon = '💗';
        }
        return item['name'] + ' ('+icon.item['stat']+')';
    }

    fight(message) {
        // TODO: build message
        enemy = this.getRandomEnemy();
        win = this.battle(this.player['stats'], enemy['stats']);
        wordStartsWithVowel = this.wordStartsVowel(enemy['type']);
        //response = wordStartsWithVowel ? 'An' : 'A';
        response = enemy['name']+' the '+enemy['type'];
        response += ' (⚔️'+enemy['stats']['attack']+', 🛡️'+enemy['stats']['defense']+')';
        response += ' attacks!';
        experience = 0;
        response += this.damagePlayer(enemy);
        if (enemy['gear']['bomb']) {
            lost = 50;
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
            if (! empty(this.player['gear']['weapon'])) {
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
        this.player['experience'] = round(experience + this.player['experience'], 2);
        this.records.savePlayer(this.player);
        response += '. You earned '+experience+'XP.';
        this.say(response);
    }

    damagePlayer(enemy) {
        damage = enemy['stats']['attack'] - this.player['stats']['defense'];
        if (damage <= 0) {
            //return ' You takes no damage.';
            return '';
        }
        this.player['health'] -= damage;
        return ' You lost ☠️'+damage+ ' HP.';
    }

    wordStartsVowel(word) {
        vowels = ['a','e','i','o','u'];
        firstLetterOfWord = strtolower(substr(word, 0, 1));
        return in_array(firstLetterOfWord, vowels);
    }

    battle(player, enemy) {
        // FORMULA = ([userdef] - [enematk]) - ([enemdef] - [useratk])
        return (player['defense'] - enemy['attack']) - (enemy['defense'] - player['attack']);
    }

    takeItOrLeaveIt(response, slot, item) {
        if (! strpos(response, 'Dropped: ')) {
            response += ' Dropped: '.this.getItemName(item);
        } else {
            response += ' Also dropped: '.this.getItemName(item);
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
        color = (new Color()).random();
        enemy = (new Enemy()).random();
        gear = {
            head: rand(0,5) === 5 ? null : generateItemBySlot('head'),
            weapon: rand(0,5) === 5 ? null : generateItemBySlot('weapon'),
            potion: rand(0,5) === 5 ? null : generateItemBySlot('potion'),
            bomb: rand(0,3) === 3
        };
        // attack - strlen(name)
        // defense - attack * [.25, .5, .75, 1, 1.25, 1.5, 1.75]
        // FORMULA = ([userdef] - [enematk]) - ([enemdef] - [useratk])
        // You defeated X with your Y. 
        // (depending on how much damage positive / negative score:) It was a critical hit! Devastating, etc
        attack = strlen(enemy) + (this.player['stats']['defense'] * 0.5) + (this.player['stats']['attack'] * 0.5);
        multipliers = [
            0.25,
            0.5,
            0.75,
            1.0,
            1.25,
            1.5,
            1.75
        ];
        defense = attack * multipliers[rand(0, count(multipliers) - 1)];
        return {
            color: color,
            type: enemy,
            name: getRandomWord(),
            gear: gear,
            stats: {
                attack: strlen(enemy) + (this.player['stats']['defense'] / 2),
                defense: defense
            }
        };
    }

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

    test() {
        response = '';
        for(i=0; i < 3; i++) {
            item = generateItemRandom();
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

