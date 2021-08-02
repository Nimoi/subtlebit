var db = require('./db.js');
var config = require('./config.json');
var queries = require('./queries.js');
const random = require('./random.js');
const got = require('got');

var MarkovChain = require('markovchain'),
    fs = require('fs'),
    quotes = new MarkovChain(fs.readFileSync('./messages.log', 'utf8'));

exports.startBlabbin = (client) => {
    blab(client);
}

function blab(client) {
    saySomething(client, config.channels[0]);
    setTimeout(function() {
        blab(client);
    }, 30000 * random(10, 30));
}

var saySomething = exports.saySomething = (client, target, string = false) => {
    let end = string ? string.trim() : random(3,20);
    console.log(end);
    let text = quotes.start(useUpperCase).end(end)
    client.say(target, text.process());
}

exports.randomSentence = () => {
    let end = random(3,20);
    let text = quotes.start(useUpperCase).end(end)
    return text.process();
}

var useUpperCase = function(wordList) {
    var tmpList = Object.keys(wordList).filter(function(word) {
        return word[0] >= 'A' && word[0] <= 'Z'
    });
    return tmpList[~~(Math.random()*tmpList.length)]
}

function buildLog() {
    queries.getAllMessages((err, rows) => {
        rows.forEach((row) => {
            fs.appendFile('messages.log', row.message+'\n', function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        });
    });
}

function deleteBotMessages() {
    db.run('delete from messages where username = ?', [config.username]);
}

function testBotMessages() {
    db.all('select message from messages where username = ?', [config.username], (err, rows) => {
        console.log(err, rows);
    });
}

