const {Records} = require(__dirname+'/records.js');
//const Mining = require('./mining.js');
//const WoodCutting = require('./woodcutting.js');
const {Place} = require('./places.js');
const {getRandomWord, generateItemBySlot, generateItem} = require('./item.js');
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
        this.updatePlayerStats();
        this.player.stats = {
            ...this.player.stats,
            ...this.getDerivedStats(this.player.stats)
        }
    }

    updatePlayerStats() {
        if (! ('strength' in this.player.stats)) {
            this.addPlayerBaseStats();
        }
        // allocate points
        let allocatedTotal = this.getPlayerTotalAllocated();
        let toAllocate = (this.player.level * 3) - allocatedTotal + 3;
        console.log('allocated', allocatedTotal, toAllocate);
        this.player.stats = this.allocateStatPoints(this.player.stats, toAllocate);
    }

    addPlayerBaseStats() {
        this.player.stats.strength = 1;
        this.player.stats.stamina = 1;
        this.player.stats.dexterity = 1;
    }

    getPlayerTotalAllocated() {
        return this.player.stats.strength
            + this.player.stats.stamina
            + this.player.stats.dexterity;
    }

    socketAdventure() {
        let enemy = this.getRandomEnemyByLevel();
        let battleResults = this.simulateBattle(enemy);
        let item = this.getItemChance();
        let decideTakeItem = item ? this.decideTakeItem(item) : false;
        let biome = this.getBiomeByLevel();

        console.log(item);

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
            decideTakeItem: decideTakeItem,
            biome: biome
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
        return generateItem(slot, this.player.level);
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
        let log = [];
        let playerTurn = true;
        while (enemy.stats.health_now > 0 && this.player.stats.health_now > 0) {
            if (log.length > 100) {
                break;
            }

            let hit = {damage: 0};
            let heal = 0;

            if (playerTurn) {
                // Player potion
                let playerHasLowHealth = this.player.stats.health_now / this.player.stats.health_max < 0.4;
                if (playerHasLowHealth && this.player.gear.potion) {
                    heal = this.player.gear.potion.stat;
                    this.player.health_now += heal;
                    this.player.gear.potion = null;
                } else {
                    // Player attack
                    hit = this.getHitDamage(this.player, enemy);
                    enemy.stats.health_now -= hit.damage;
                    if (enemy.stats.health_now < 0) {
                        enemy.stats.health_now = 0;
                    }
                }
            }

            if (! playerTurn) {
                // Enemy attack
                hit = this.getHitDamage(enemy, this.player);
                this.player.stats.health_now -= hit.damage;
                if (this.player.stats.health_now < 0) {
                    this.player.stats.health_now = 0;
                }
            }

            log.push({
                hit: hit,
                heal: heal,
                playerHealth: this.player.stats.health_now,
                enemyHealth: this.player.stats.health_now,
                turn: playerTurn ? 'player' : 'enemy'
            });

            playerTurn = ! playerTurn;
        }
        let experience = this.player.stats.health_now > 0 ? enemy.level * 4 : 0;
        this.addExperience(experience);
        let currency = this.player.stats.health_now > 0 ? enemy.currency : 0;
        this.player.currency += currency;
        this.records.savePlayer(this.player);
        console.log(experience, currency);
        return {
            log: log,
            experience: experience,
            currency: currency
        };
    }

    getHitDamage(attacker, target) {
        let hit = {
            damage: 0,
            critical: false
        };
        let damage = getRandomInt(attacker.stats.power * 0.8, attacker.stats.power * 1.2) * 0.25;
        damage -= target.stats.defense * 0.1;
        if (Math.random() > 1 - attacker.stats.critical_chance) {
            damage *= 2;
            hit.critical = true;
            console.log('critical!');
        }
        damage = this.applyAttackModifiers(attacker, damage);
        hit.damage = damage >= 0 ? Math.ceil(damage) : 0
        return hit;
    }

    applyAttackModifiers(attacker, damage) {
        if (! ('modifiers' in attacker)) {
            return damage;
        }
        if (attacker.modifiers.includes('fiery')) {
            // Add 10% fire damage
            damage += damage * 0.1;
        }
        return damage;
    }

    getDerivedStats(stats) {
        let gearDefense = 0;
        let gearPower = 0;
        for (let slot in this.player.gear) {
            let item = this.player.gear[slot];
            if (! item) {
                continue;
            }
            switch (slot) {
                case 'head':
                    gearDefense += item.stat;
                    break;
                case 'weapon':
                    gearPower += item.stat;
                    break;
            }
        }
        return {
            health_max: 10 + stats.stamina * 2,
            health_now: 10 + stats.stamina * 2,
            power: (stats.strength * 2) + gearPower,
            defense: 1 + gearDefense,
            critical_chance: stats.dexterity * 0.1
        }
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
        this.socketAdventure();
    }

    getRandomEnemyByLevel() {
        let tier = this.getEnemyTier();
        let enemy = getRandomItem(tier.enemies);
        let level = getRandomInt(tier.min, tier.max);
        let color = (new Color()).random();
        let modifiers = 'modifiers' in tier
            ? tier.modifiers
            : [];
        
        // allocate stat points - 3 per level
        let stats = {
            strength: 1,
            stamina: 1,
            dexterity: 1
        };
        let statMultiplier = Math.ceil(level / 3);
        if (statMultiplier > 3) {
            statMultiplier = 3;
        }
        stats = this.allocateStatPoints(stats, level * statMultiplier);
        stats = {
            ...stats,
            ...this.getDerivedStats(stats)
        };
        return {
            level: level,
            color: color,
            type: enemy,
            name: getRandomWord(),
            stats: stats,
            currency: getRandomInt(0, Math.ceil(level*1.2)),
            modifiers: modifiers
        };
    }

    allocateStatPoints(stats, points) {
        for (let i = 0; i < points; i++) {
            switch(getRandomInt(1,3)) {
                case 1:
                    stats.strength++;
                    break;
                case 2:
                    stats.stamina++;
                    break;
                case 3:
                    stats.dexterity++;
            }
        }
        return stats;
    }

    getEnemyTier() {
        return this.getEnemyTiers().find((tier) => {
            return this.player.level >= tier.min && this.player.level <= tier.max;
        });
    }

    getEnemyTiers() {
        return [
            {
                min: 1,
                max: 5,
                enemies: [
                    'Rat',
                    'Spider',
                    'Cow',
                    'Sheep'
                ]
            },
            {
                min: 6,
                max: 10,
                enemies: [
                    'Goblin',
                    'Skeleton',
                    'Wolf',
                    'Bandit'
                ]
            },
            {
                min: 11,
                max: 15,
                enemies: [
                    'Ninja',
                    'Pirate',
                    'Mummy',
                    'Ogre',
                    'Demon'
                ]
            },
            {
                min: 16,
                max: 20,
                enemies: [
                    'Wind Golem',
                    'Water Golem',
                    'Earth Golem',
                    'Fire Golem'
                ]
            },
            {
                min: 21,
                max: 25,
                enemies: [
                    'Wraith',
                    'Wight',
                    'Ghoul',
                    'Husk'
                ]
            },
            {
                min: 26,
                max: 30,
                enemies: [
                    'Rat',
                    'Spider',
                    'Cow',
                    'Sheep'
                ],
                modifiers: [
                    'fiery'
                ]
            }
        ];
    }

    getBiomeByLevel() {
        let biome = this.getBiomeTiers().find((tier) => {
            return this.player.level >= tier.min && this.player.level <= tier.max;
        });
        return getRandomItem(biome.biomes);
    }

    getBiomeTiers() {
        return [
            {
                min: 1,
                max: 5,
                biomes: [
                    'spring',
                    'summer',
                ]
            },
            {
                min: 6,
                max: 10,
                biomes: [
                    'summer',
                    'fall',
                ]
            },
            {
                min: 11,
                max: 15,
                biomes: [
                    'fall',
                    'winter',
                ]
            },
            {
                min: 16,
                max: 20,
                biomes: [
                    'winter',
                    'spring',
                ]
            },
            {
                min: 21,
                max: 25,
                biomes: [
                    'spring',
                    'summer',
                    'fall',
                    'winter',
                ]
            },
            {
                min: 26,
                max: 30,
                biomes: [
                    'fall',
                    'winter',
                ]
            }
        ];
    }

    isInputACommand() {
        return this.commands.find((command) => {
            return this.input.trim().substr(0, command.length) === command
        });
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

        let isWeaponSlot = weaponNames.indexOf(params) !== -1 ? 'weapon' : false;
        let isHeadSlot = headNames.indexOf(params) !== -1 ? 'head' : false;
        let isPotionSlot = potionNames.indexOf(params) !== -1 ? 'potion' : false;
        
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
            this.say(this.user + ' has no gear. Try having some !rpg');
            return;
        }

        let itemValues = Object.keys(this.player.gear).filter((slot) => {
            return this.player.gear[slot] !== null;
        }).map((slot) => {
            let item = this.player.gear[slot];
            item.value = item.stat * 10;
            return this.getItemName(item) + ' $'+item.value;
        });

        let message = this.user + '\'s inventory: ';
        message += itemValues.join(', ');
        this.say(message);
    }

    stats() {
        let message = this.user + '\'s stats: ';
        message += '💗'+this.player.stats.stamina+', ';
        message += '💪'+this.player.stats.strength+', ';
        message += '🏃'+this.player.stats.dexterity+', ';
        message += '⚔️'+this.player.stats.power+', ';
        message += '🛡️'+this.player.stats.defense+', ';
        message += '🔮'+this.player.experience+' XP.';
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
        this.say('Go on an adventure here in this chat. Earn some XP. Find some loot. Get dead maybe too? Try !rpg commands');
    }

    commands() {
        this.say('!rpg - go on an adventure, !rpg potion - drink your potion, !rpg inventory - check your gear, !rpg sell - sell your gear, !rpg help - learn more');
    }

    say(message) {
        this.messages.push(message);
    }

    sayQueue() {
        setInterval(() => {
            if (this.messages.length) {
                this.client.say(this.target, '/me '+this.messages.shift());
            }
        }, 1500);
    }
}
