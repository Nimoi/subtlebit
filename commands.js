const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
const moji = require('moji-translate');
const messages = require('./messages.js');
const teller = require('fortune-teller');

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
            signature: '!SARCASTICPIRATE',
            exclusive: true,
            execute(text, target, context) {
                client.say(target,  `${studly(pirate(text))}`);
            }
        },
        {
            signature: '!RANDQUOTE',
            exclusive: true,
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
            signature: '!TEST',
            exclusive: true,
            execute(text, target, context) {
                messages.test(client, target);
            }
        },
        // const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
    ];
}
