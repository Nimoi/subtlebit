var db = require('./db.js');

// Top Chats

const topChatsBaseQuery = `SELECT username, count(username) as chats FROM messages WHERE message_type = 'chat' AND (signature = '!SAY' OR signature IS NULL)`;
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

exports.addAchievement = (count, search = null) => {

}
