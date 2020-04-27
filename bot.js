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
        console.log(`* ${context.username} ${msg}`);
        let warnings = alex(msg).messages;
        if (! warnings.length) {
            return;
        }
        warnings.forEach((warning) => {
            console.log(warning.message);
        });
        return;
    }
    handleCommand(message, target, context);
}

function onConnected (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

const commands = [
    {
        signature: ':D',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `/me ${cool()}`);
        }
    },
    {
        signature: ':3',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `/me ${cats()}`);
        }
    },
    {
        signature: 'YES',
        exclusive: true,
        execute(text, target, context) {
            client.say(target, `/me ${yesNoWords.yesRandom()}`);
        }
    },
    {
        signature: 'NO',
        exclusive: true,
        execute(text, target, context) {
            client.say(target, `/me ${yesNoWords.noRandom()}`);
        }
    },
    {
        signature: 'AWESOME',
        exclusive: true,
        execute(text, target, context) {
            client.say(target, `/me ${v.capitalize(superb.random())}`);
        }
    },
    {
        signature: '!MOJI',
        exclusive: false,
        execute(text, target, context) {
            let translated = moji.translate(text);
            client.say(target, `/me ${translated}`);
        }
    },
    {
        signature: '!PIRATE',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `/me ${pirate(text)}`);
        }
    },
    {
        signature: '!SCOTTISH',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `/me ${scottish(text)}`);
        }
    },
    {
        signature: '!:3',
        exclusive: false,
        execute(text, target, context) {
            client.say(target, `/me ${ky00te(text)}`);
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
        console.log(`* ${context.username} does not have permission to run ${signature}.`);
        return
    }

    command.execute(text, target, context);
    console.log(`* ${context.username} executed ${signature}.`);
}

function canRunCommand(command, context) {
    return ! command.exclusive || isUserWhitelisted(context.username);
}

function isUserWhitelisted(user) {
    return config.whitelist.indexOf(user) > -1;
}

var stdin = process.openStdin();
stdin.addListener("data", function(d) {
    let message = d.toString().trim();
    console.log("$ [" + message + "]");
    return onMessage(
        config.cli.channel,
        { username: config.username },
        message,
        false
    );
});
