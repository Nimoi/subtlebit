const config = require('./config.json');
const tmi = require('tmi.js');
const cool = require('cool-ascii-faces');
const cats = require('cat-ascii-faces');
const yesNoWords = require('yes-no-words');
const superb = require('superb');
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
const moment = require('moment');
const messages = require('./messages.js');
const animals = require('./animals.js');
const markov = require('./markov.js');
const sockets = require('./sockets.js');
const axios = require('axios');
const fs = require('fs');

sockets.start();

const opts = {
  identity: {
    username: config.username,
    password: config.password
  },
  channels: config.channels
};

var state = {
    connection_timeout: 1,
};

const client = new tmi.client(opts);

client.on('message', onMessage);
client.on('connected', onConnected);
client.on('disconnected', onDisconnected);
client.connect();

const commands = setupCommands(client);

var users = {};

function onDisconnected (message) {
    printMessage(chalk.red(`* Disconnected: ${message}`));
    reconnect();
}

function reconnect() {
    printMessage(chalk.yellow(`* Attempting reconnect in ${state.connection_timeout}s`));
    setTimeout(() => {
        client.connect().catch((err) => {
            console.log('Connection error!', err)
            state.conection_timeout *= 2;
            reconnect();
        });
    }, state.connection_timeout * 1000);
}

function onConnected (addr, port) {
  state.connection_timeout = 1;
  printMessage(chalk.green(`* Connected to ${addr}:${port}`));
}

//markov.startBlabbin(client);

function onMessage (target, context, msg, self) {
    const message = msg.trim();

    if (self) {
        // Ignore messages from the bot
        printMessage(chalk.green(`$ ${printUsername(context)} message: ${msg}`));
        return;
    }

    if (! (context.username in users)) {
        getUserData(context);
    }

    /*
    sockets.io.emit('chat', {
        context: context, 
        message: message, 
        data: users[context.username]
    });
    */

    let logData = {
        target: target,
        context: context,
        message: message,
        self: self,
        signature: null,
        text: null,
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    printEmotes(context.emotes);

    if (! hasCommand(message)) {
        messages.log(logData);
        handleChatMessage(context, message);
        return;
    }

    let signature = getSignatureFromString(message);
    let command = getCommandBySignature(signature);
    let text = parseText(message.slice(signature.length));

    logData.signature = signature;
    logData.text = text;

    messages.log(logData);

    if (! canRunCommand(command, context)) {
        printMessage(chalk.yellow(`! ${printUsername(context)} does not have permission to run ${signature}.`));
        return;
    }

    command.execute(text, target, context, sockets);
    printMessage(chalk.magenta(`$ ${printUsername(context)} executed ${signature}.`));
}

function getUserData(context) {
    axios.get(`https://api.twitch.tv/helix/users?login=${context.username}`, {
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Client-ID': config.client_id
        }
    }).then((response) => {
        if (! response.hasOwnProperty('data')) {
            console.log(response);
            return;
        }
        if (! response.data.hasOwnProperty('data')) {
            console.log(response.data);
            return;
        }
        const data = response.data.data.shift();
        users[context.username] = data;
        checkUserCache(data);
    });
}

function checkUserCache(data) {
    // Check if user image cached
    fs.readdir(__dirname+'/public/cache', (err, files) => {
        if (files.indexOf(data.login+'.jpg') === -1) {
            return cacheUserImage(data);
        }
    });
}

function cacheUserImage(data) {
    axios({
        method: "get",
        url: data.profile_image_url,
        responseType: "stream"
    }).then(function (response) {
        response.data.pipe(fs.createWriteStream(__dirname+'/public/cache/'+data.login+'.jpg'));
    });
}

function printEmotes(emotes) {
    if (emotes !== null) {
        for (let emote in emotes) {
            (async () => {
                const body = await got(`https://static-cdn.jtvnw.net/emoticons/v1/${emote}/1.0`).buffer();
                printMessage(await terminalImage.buffer(body));
            })();
        }
    }
}

function handleChatMessage(context, message) {
    printMessage(chalk.rgb(200,200,200)(`* ${printUsername(context)} ${message}`));
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
        .replace(/\b(:awesome)\b/g, superb.random())
        .replace(/\b(:yes)\b/g, yesNoWords.yesRandom())
        .replace(/\b(:no)\b/g, yesNoWords.noRandom())
        .replace(/\B(:hero)\b/g, superheroes.random())
        .replace(/\B(:villain)\b/g, supervillains.random())
        .replace(/\B(:pokemon)\b/g, pokemon.random())
        .replace(/\B(:dog)\b/g, dogNames.allRandom())
        .replace(/\B(:cat)\b/g, catNames.random())
        .replace(/\B(:animal)\b/g, animals.random());
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
            message_type: 'chat',
            color: '#0084ff'
        },
        line,
        false
    );
}).on('close', () => {
    printMessage(chalk.bold('Bye!'));
});

function printMessage(message) {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    console.log(message);
    rl.prompt(true);
}

/*
setInterval(() => {
    printMessage(chalk.bold('Quote test!'));
    onMessage(
        config.cli.channel,
        {
            'display-name': config.username,
            username: config.username,
            message_type: 'chat',
            color: '#0084ff'
        },
        '!randquote',
        false
    );
}, 1000 * 60 * 1);
*/
