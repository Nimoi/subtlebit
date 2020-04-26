const config = require('./config.json');
const tmi = require('tmi.js');
const moji = require('moji-translate');
const emoji = require('node-emoji');

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
        console.log(`* ${context['display-name']} ${msg}`);
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
        execute(text, target, context) {
            client.say(target, `/me :D ${emoji.get('coffee')}`);
            console.log(`* Executed ${this.signature} command`);
        }
    },
    {
        signature: '!moji',
        execute(text, target, context) {
            let translated = moji.translate(text);
            client.say(target, `/me ${translated}`);
        }
    }
];

function hasCommand(message) {
    return getSignatureFromString(message) !== undefined;
}

function getSignatureFromString(message) {
    let signatures = getSignatures();
    return signatures.filter((signature) => {
        return message.startsWith(signature);
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
    let text = message.replace(signature, '');

    command.execute(text, target, context);
}
