const config = require('./config.json');
const tmi = require('tmi.js');
const moji = require('moji-translate');
const emoji = require('node-emoji');
const alex = require('alex');
const cool = require('cool-ascii-faces');
const cats = require('cat-ascii-faces');
const yesNoWords = require('yes-no-words');
const superb = require('superb');
const v = require('voca');
const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
const readline = require('readline');

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

const commands = [
    {
        signature: ':D',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `${cool()}`);
        }
    },
    {
        signature: ':3',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `${cats()}`);
        }
    },
    {
        signature: 'YES',
        exclusive: true,
        execute(text, target, context) {
            client.say(target, `${yesNoWords.yesRandom()}`);
        }
    },
    {
        signature: 'NO',
        exclusive: true,
        execute(text, target, context) {
            client.say(target, `${yesNoWords.noRandom()}`);
        }
    },
    {
        signature: 'AWESOME',
        exclusive: true,
        execute(text, target, context) {
            client.say(target, `${v.capitalize(superb.random())}`);
        }
    },
    {
        signature: '!MOJI',
        exclusive: false,
        execute(text, target, context) {
            let translated = moji.translate(text);
            client.say(target, `${translated}`);
        }
    },
    {
        signature: '!PIRATE',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `${pirate(text)}`);
        }
    },
    {
        signature: '!SCOTTISH',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `${scottish(text)}`);
        }
    },
    {
        signature: '!:3',
        exclusive: false,
        execute(text, target, context) {
            client.say(target,  `${ky00te(text)}`);
        }
    },
    {
        signature: '!SAY',
        exclusive: true,
        execute(text, target, context) {
            client.say(target,  text);
        }
    }
    // const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
];

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
    let text = message.slice(signature.length);

    if (! canRunCommand(command, context)) {
        log(`* ${context.username} does not have permission to run ${signature}.`);
        return
    }

    command.execute(text, target, context);
    log(`* ${context.username} executed ${signature}.`);
}

function canRunCommand(command, context) {
    return ! command.exclusive || isUserWhitelisted(context.username);
}

function isUserWhitelisted(user) {
    return config.whitelist.indexOf(user) > -1;
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '!> '
});

rl.prompt();

rl.on('line', (line) => {
    let signature = getSignatureFromString(line);
    if (signature === undefined) {
        line = '!say '+line;
    }
    console.log(signature);
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
