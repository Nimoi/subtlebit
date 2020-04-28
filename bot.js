const config = require('./config.json');
const tmi = require('tmi.js');
const emoji = require('node-emoji');
const alex = require('alex');
const cool = require('cool-ascii-faces');
const cats = require('cat-ascii-faces');
const yesNoWords = require('yes-no-words');
const superb = require('superb');
const v = require('voca');
//const hero = require();
const readline = require('readline');
const setupCommands = require('./commands.js');
const superheroes = require('superheroes');
const supervillains = require('supervillains');
const pokemon = require('pokemon');
const dogNames = require('dog-names');
const catNames = require('cat-names');

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

    const message = msg.trim();
    if (! hasCommand(message)) {
        log(`* ${context.username} ${msg}`);
        let warnings = alex(msg).messages;
        if (! warnings.length) {
            return;
        }
        warnings.forEach((warning) => {
            log(warning.message);
        });
        return;
    }
    handleCommand(message, target, context);
}

function onConnected (addr, port) {
  log(`* Connected to ${addr}:${port}`);
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
        log(`! ${context.username} does not have permission to run ${signature}.`);
        return;
    }

    command.execute(text, target, context);
    log(`$ ${context.username} executed ${signature}.`);
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
        { username: config.username },
        line,
        false
    );
}).on('close', () => {
    log('Bye!');
});

function log(message) {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    console.log(message);
    rl.prompt(true);
}
