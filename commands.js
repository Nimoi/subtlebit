const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
const moji = require('moji-translate');

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
        // const { b1ff, censor, chef, cockney, eleet, fudd, jethro, pirate, jibberish, ken, kenny, klaus, ky00te, LOLCAT, nethackify, newspeak, nyc, rasterman, scottish, scramble, spammer, studly, upsidedown } = require('talk-like-a');
    ];
}
