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

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
console.log(target, context, msg, self);

  const commandName = msg.trim();

  if (commandName === '!dice') {
    const num = rollDice();
    client.say(target, `/me You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
	return;
  }

	if (commandName === ':D') {
	    client.say(target, `/me :D ${emoji.get('coffee')}`);
	    console.log(`* Executed ${commandName} command`);
	}

	if (commandName.startsWith('!moji')) {
		let text = commandName.replace('!moji', '');
		let translated = moji.translate(text);
		console.log(translated);
		    client.say(target, `/me ${translated}`);
	}

	console.log(`* ${context['display-name']} ${commandName}`);
}

function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
