const fs = require('fs');

/**
 * Play a little quip game in chat
 * 1 - Bot gives a quip prompt
 * 2 - First four players to submit an answer with !quip are entered
 * 3 - Bot displays four answers. Asks uses to vote A,B,C,D in chat
 * 4 - After ~30 seconds a winner is announced
 *
 * Forbidden answers:
 * - Stink Wig
 * - Gunt
 *
 * TODO: accept answers with /w instead of !quip
 */

var isQuipping = false;
var entries = {};
var votes = {};
var maxEntries = 4;
var prompt = 'What does this acronym stand for: GUNT';

const loadConfig = () => {
    let rawdata = fs.readFileSync('quips.json');
    return JSON.parse(rawdata);
};

var config = loadConfig();
var prompts = config.prompts;

const getRandomPrompt = () => {
    return prompts[Math.floor(Math.random() * prompts.length)];
};

// Add quip line
exports.addQuip = (client, target, text) => {
    config.prompts.push(text.trim());
    client.say(target, `/me Your quip has been added!`);
    saveConfig();
};

const saveConfig = () => {
    fs.writeFileSync('quips.json', JSON.stringify(config));
};

// Start a new quip round
exports.initQuip = (client, target, text) => {
    resetGame();
    isQuipping = true;
    prompt = getRandomPrompt();
    if (parseInt(text)) {
        maxEntries = parseInt(text);
    }
    client.say(target, `/me ${prompt} - enter !quip to answer now!`);

    setTimeout(() => {
        if (! isQuipping) {
            return;
        }
        isQuipping = false;

        // Not enough players entered, cancel it
        if (Object.keys(entries).length < 2) {
            resetGame();
            client.say(target, `/me Not enough players entered the quip.`);
            return;
        }

        // Go with what we have
        announceEntries(client, target);
    }, 120 * 1000);
};

const resetGame = () => {
    entries = {};
    votes = {};
    maxEntries = 4;
};

// Handle !quip entries
exports.onQuip = (client, target, text, context) => {
    if (! isQuipping || hasMaxEntries()) {
        return false;
    }
    if (! text) {
        client.say(target, '/me Please enter an answer: !gunt <answer>');
    }

    addEntry(context['display-name'], text.trim());

    if (hasMaxEntries()) {
        announceEntries(client, target);
        isQuipping = false;
    }
};

const addEntry = (name, entry) => {
    entries[name] = entry;
};

const hasMaxEntries = () => {
    return Object.keys(entries).length === maxEntries;
};

// Show nominates
const announceEntries = (client, target) => {
    client.say(target, `/me "!vote #" for your favorite answer: ${prompt}`);
    let index = 0;
    let message = `/me `;
    for (let name in entries) {
        index++;
        let divider = index < Object.keys(entries) ? '// ' : '';
        message += `[${index}]: ${entries[name]} ${divider}`;
    }

    setTimeout(() => {
        client.say(target, message);
    }, 1500);

    // Announce Winner
    setTimeout(() => {
        announceWinner(client, target);
    }, 1000 * 30);
};

// Handle votes
exports.onVote = (client, target, text, context) => {
    if (isNaN(parseInt(text)) 
        || parseInt(text) < 1 
        || parseInt(text) > maxEntries) {
        return false;
    }
    if (context['display-name'] in entries) {
        client.say(target, '/me You may not vote if you have entered.');
        return;
    }
    addVote(context['display-name'], parseInt(text));
};

const addVote = (name, vote) => {
    votes[name] = vote;
};

// Show winner
const getVoteCounts = () => {
    return Object.values(votes).reduce((carry, value) => {
        if (! (value in carry)) {
            carry[value] = 0;
        }
        carry[value]++;
        return carry;
    }, {});
};

const getWinner = () => {
    let voteCounts = getVoteCounts();
    return Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
};

const announceWinner = (client, target) => {
    if (Object.keys(votes).length === 0) {
        client.say(target, `/me No one voted! Try again next time.`);
        return;
    }

    let winnerIndex = getWinner();

    let message = Object.keys(entries).reduce((carry, name, index) => {
        if (index+1 == winnerIndex) {
            return `/me ${name} won with ${getVoteCounts()[winnerIndex]} votes! "${entries[name]}"`;
        }
        return carry;
    }, '');

    client.say(target, message);
};


