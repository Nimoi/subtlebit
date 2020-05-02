var db = require('./db.js');
var config = require('./config.js');
var queries = require('./queries.js');
const random = require('./random.js');
const got = require('got');

var MarkovChain = require('markovchain'),
    fs = require('fs'),
    quotes;

exports.startBlabbin = (client) => {
    var quotes = new MarkovChain(fs.readFileSync('./messages.log', 'utf8'))
    blab(client, quotes);
}

function blab(client, quotes) {
    setTimeout(function() {
        let text = quotes.start(useUpperCase).end(random(3,20)).process();
        client.say(config.channels[0], text);
        blab(client, quotes);
    }, 30000 * random(10, 30));
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

