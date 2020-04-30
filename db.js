var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chatlog.sqlite3', createTables);
module.exports = db;

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT,
        username TEXT,
        color TEXT,
        emotes TEXT,
        message_type TEXT,
        mod INTEGER,
        subscriber INTEGER,
        user_id INTEGER,
        timestamp TEXT,
        channel TEXT,
        message TEXT,
        self INTEGER,
        signature TEXT,
        text TEXT
    )`);
}
