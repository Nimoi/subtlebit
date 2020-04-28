const config = require('./config.json');
const tmi = require('tmi.js');
const emoji = require('node-emoji');
const alex = require('alex');
const cool = require('cool-ascii-faces');
const cats = require('cat-ascii-faces');
const yesNoWords = require('yes-no-words');
const superb = require('superb');
const v = require('voca');
const readline = require('readline');
const setupCommands = require('./commands.js');
const superheroes = require('superheroes');
const supervillains = require('supervillains');
const pokemon = require('pokemon');
const dogNames = require('dog-names');
const catNames = require('cat-names');
const chalk = require('chalk');
const terminalImage = require('terminal-image');
const got = require('got');

const opts = {
  identity: {
    username: config.username,
    password: config.password
  },
  channels: config.channels
};

const client = new tmi.client(opts);

client.on('message', onMessage);
client.on('connected', onConnected);
client.connect();

const commands = setupCommands(client);

function onMessage (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    // logMessage({
        // target, context, msg, self
    // })

    if (context.emotes !== null) {
        for (let emote in context.emotes) {
            (async () => {
                const body = await got(`https://static-cdn.jtvnw.net/emoticons/v1/${emote}/1.0`).buffer();
                console.log(await terminalImage.buffer(body));
            })();
        }
    }
    const message = msg.trim();
    if (! hasCommand(message)) {
        log(chalk.rgb(200,200,200)(`* ${printUsername(context)} ${msg}`));
        let warnings = alex(msg).messages;
        if (! warnings.length) {
            return;
        }
        warnings.forEach((warning) => {
            log(chalk.rgb(100,100,100)(warning.message));
        });
        return;
    }
    handleCommand(message, target, context);
}

function onConnected (addr, port) {
  log(chalk.green(`* Connected to ${addr}:${port}`));
}

function hasCommand(message) {
    return getSignatureFromString(message) !== undefined;
}

function getSignatureFromString(message) {
    let signatures = getSignatures();
    return signatures.filter((signature) => {
        return message.toUpperCase().startsWith(signature);
    }).pop();
}

function getCommandBySignature(signature) {
    return commands.filter((command) => {
        return command.signature === signature;
    }).pop();
}

function getSignatures() {
    return commands.reduce((carry, command) => {
        carry.push(command.signature);
        return carry;
    }, []);
}

function handleCommand(message, target, context) {
    let signature = getSignatureFromString(message);
    let command = getCommandBySignature(signature);
    let text = parseText(message.slice(signature.length));

    if (! canRunCommand(command, context)) {
        log(chalk.yellow(`! ${printUsername(context)} does not have permission to run ${signature}.`));
        return;
    }

    command.execute(text, target, context);
    log(chalk.magenta(`$ ${printUsername(context)} executed ${signature}.`));
}

function printUsername(context) {
    return chalk.hex(context.color)(context['display-name']);
}

function canRunCommand(command, context) {
    return ! command.exclusive || isUserWhitelisted(context.username);
}

function isUserWhitelisted(user) {
    return config.whitelist.indexOf(user) > -1;
}

function parseText(text) {
    return text
        .replace(/\B(:D)\b/g, cool())
        .replace(/\B(:3)\b/g, cats())
        .replace(/\b(awesome)\b/g, superb.random())
        .replace(/\b(yes)\b/g, yesNoWords.yesRandom())
        .replace(/\b(no)\b/g, yesNoWords.noRandom())
        .replace(/\B(:hero)\b/g, superheroes.random())
        .replace(/\B(:villain)\b/g, supervillains.random())
        .replace(/\B(:pokemon)\b/g, pokemon.random())
        .replace(/\B(:dog)\b/g, dogNames.allRandom())
        .replace(/\B(:cat)\b/g, catNames.random());
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '!> '
});

rl.prompt();

rl.on('line', (line) => {
    if (line.length === 0) {
        rl.prompt(true);
        return;
    }
    let signature = getSignatureFromString(line);
    if (signature === undefined) {
        line = '!say '+line;
    }
    onMessage(
        config.cli.channel,
        {
            'display-name': config.username,
            username: config.username,
            color: '#0084ff'
        },
        line,
        false
    );
}).on('close', () => {
    log(chalk.bold('Bye!'));
});

function log(message) {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    console.log(message);
    rl.prompt(true);
}
