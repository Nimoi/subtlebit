var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chatlog.sqlite3', createTables);

// TODO don't repeat these.. store the values and map them for different situations
exports.log = (data) => {
    db.run(`INSERT INTO messages (
        id,
        username,
        color,
        emotes,
        message_type,
        mod,
        subscriber,
        user_id,
        timestamp,
        channel,
        message,
        self,
        signature,
        text
    ) VALUES (
        $id,
        $username,
        $color,
        $emotes,
        $message_type,
        $mod,
        $subscriber,
        $user_id,
        $timestamp,
        $channel,
        $message,
        $self,
        $signature,
        $text
    )`, {
        $id: data.context.id,
        $username: data.context.username,
        $color: data.context.color,
        $emotes: data.context['emotes-raw'],
        $message_type: data.context['message-type'],
        $mod: data.context.mod ? 1 : 0,
        $subscriber: data.context.subscriber ? 1 : 0,
        $user_id: data.context['user-id'],
        $timestamp: data.timestamp,
        $channel: data.target,
        $message: data.message,
        $self: data.self,
        $signature: data.signature,
        $text: data.text,
    });
};

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

exports.randomQuote = (client, target) => {
    db.get(`SELECT * FROM messages WHERE username != 'nimoii' AND message_type = 'chat' AND signature IS NULL ORDER BY random() limit 1`, (err, row) => {
        client.say(target,  `"${row.message}" - ${row.username}`);
    });
}
