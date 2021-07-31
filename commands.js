const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
const moji = require('moji-translate');
const messages = require('./messages.js');
const timer = require('./timer.js');
const markov = require('./markov.js');
const teller = require('fortune-teller');
const quip = require('./quip.js');
import {haveAnAdventure} from require('./aventure/index.js');

module.exports = function (client) {
    return [
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
        },
        {
            signature: '!SARCASM',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${studly(text)}`);
            }
        },
        {
            signature: '!COCKNEY',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${cockney(text)}`);
            }
        },
        {
            signature: '!1337',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${eleet(text)}`);
            }
        },
        {
            signature: '!P1R473',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${eleet(pirate(text))}`);
            }
        },
        {
            signature: '!SPAM',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${spammer(text)}`);
            }
        },
        {
            signature: '!SARCASTICPIRATE',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${studly(pirate(text))}`);
            }
        },
        {
            signature: '!RANDQUOTE',
            exclusive: false,
            execute(text, target, context) {
                messages.randomQuote(client, target);
            }
        },
        {
            signature: '!FORTUNE',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${teller.fortune(pirate(text))}`);
            }
        },
        {
            signature: '!TOP3',
            exclusive: true,
            execute(text, target, context) {
                messages.topThree(client, target);
            }
        },
        {
            signature: '!TOP3MATCH',
            exclusive: true,
            execute(text, target, context) {
                messages.topThreeMatch(client, target, text);
            }
        },
        {
            signature: '!TIMER',
            exclusive: true,
            execute(text, target, context) {
                let title = text.length
                    ? text
                    : '';
                timer.start(title);
            }
        },
        {
            signature: '!DELAY',
            exclusive: true,
            execute(text, target, context) {
                let parts = text.split(' ').filter(function(e) {
                    return String(e).trim();
                });
                let time = parts.shift();
                let message = parts.join(' ');
                if (isNaN(time)) {
                    time = 1;
                }
                setTimeout(() => {
                    client.say(target, message);
                }, time * 1000);
            }
        },
        {
            signature: '!STOP',
            exclusive: true,
            execute(text, target, context) {
                client.say(target, timer.stop());
            }
        },
        {
            signature: '!ADDACHIEVEMENT',
            exclusive: true,
            execute(text, target, context) {
                achievements.add(text);
            }
        },
        {
            signature: '!PYRAMID',
            exclusive: true,
            execute(text, target, context) {
                client.say(target, text);
                client.say(target, text+' '+text);
                client.say(target, text+' '+text+' '+text);
                client.say(target, text+' '+text);
                client.say(target, text);
            }
        },
        {
            signature: '!SLAP',
            exclusive: true,
            execute(text, target, context) {
                text = `👋👋👋${text}👋👋👋`;
                client.say(target, text);
            }
        },
        {
            signature: '!XSAID',
            exclusive: true,
            execute(text, target, context) {
                messages.timesSaid(client, target, text);
            }
        },
        {
            signature: '!BLAH',
            exclusive: true,
            execute(text, target, context) {
                markov.saySomething(client, target, text);
            }
        },
        {
            signature: '!TEST',
            exclusive: true,
            execute(text, target, context) {
                messages.test(client, target);
            }
        },
        {
            signature: '!STARTQUIP',
            exclusive: true,
            execute(text, target, context) {
                quip.initQuip(client, target, text);
            }
        },
        {
            signature: '!QUIP',
            exclusive: false,
            execute(text, target, context) {
                quip.onQuip(client, target, text, context);
            }
        },
        {
            signature: '!VOTE',
            exclusive: false,
            execute(text, target, context) {
                quip.onVote(client, target, text, context);
            }
        },
        {
            signature: '!ADDQUIP',
            exclusive: false,
            execute(text, target, context) {
                quip.addQuip(client, target, text);
            }
        },
        {
            signature: '!ADVENTURE',
            exclusive: false,
            execute(text, target, context) {
                haveAnAdventure(client, target, text, context);
            }
        },
        // const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
    ];
}
