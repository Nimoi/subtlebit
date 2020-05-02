const config = require('./config.json');
var db = require('./db.js');

// Top Chats

const chatsOnlyConditions = `WHERE message_type = 'chat' AND (signature = '!SAY' OR signature IS NULL)`;
const topChatsBaseQuery = `SELECT username, count(username) as chats FROM messages ${chatsOnlyConditions}`;
const topChatsEndQuery = `GROUP BY username ORDER BY chats desc`;
const topEndQuery = topChatsEndQuery + ` limit 1`;
const topThreeEndQuery = topChatsEndQuery + ` limit 3`;

exports.getTop = (callback) => {
    db.get(`${topChatsBaseQuery} ${topEndQuery}`, callback);
}

exports.getTopMatching = (search, callback) => {
    db.get(`${topChatsBaseQuery} AND message like ? ${topEndQuery}`, [`%${search}%`], callback);
}

exports.getTopForUser = (username, callback) => {
    db.get(`${topChatsBaseQuery} AND username = ? ${topEndQuery}`, [username], callback);
}

exports.getTopMatchingForUser = (username, search, callback) => {
    db.get(`${topChatsBaseQuery} AND username = ? AND message like ? ${topEndQuery}`, [username, `%${search}%`], callback);
}

exports.getTopThree = (callback) => {
    db.all(`${topChatsBaseQuery} ${topThreeEndQuery}`, callback);
}

exports.getTopThreeMatching = (search, callback) => {
    db.all(`${topChatsBaseQuery} AND message like ? ${topThreeEndQuery}`, [`%${search}%`], callback);
}

exports.addAchievement = (title, criteria) => {
    db.run(`INSERT INTO achievements (
        title,
        criteria
    ) VALUES (
        $title,
        $criteria
    )`, {
        $title: title,
        $criteria: criteria,
    });
};

exports.earnAchievement = (user, achievement, callback) => {
    db.run(`INSERT INTO user_achievements (
        achievement,
        username,
        timestamp
    ) VALUES (
        $achievement,
        $username,
        $timestamp
    )`, {
        $achievement: achievement,
        $username: username,
        $timestamp: getTimestamp(),
    }, callback);
};

function getTimestamp() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

exports.checkAchievement = (username, achievement, callback) => {
    db.get(`select * from achievements where username = ? and title = ?`, [username, title], callback);
}

exports.getAchievements = (username, callback) => {
    db.get(`select * from achievements where username = ?`, [username], callback);
}

exports.getAllMessages = (callback) => {
    db.all(`select message from messages ${chatsOnlyConditions} AND username != `, [config.username], callback);
}
