var db = require('./db.js');
var queries = require('./queries.js');
var fs = require('fs');

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

    fs.appendFile('messages.log', data.message+'\n', function (err) {
        if (err) throw err;
    });
};

exports.randomQuote = (client, target) => {
    db.get(`SELECT * FROM messages WHERE username != 'nimoii' AND message_type = 'chat' AND signature IS NULL ORDER BY random() limit 1`, (err, row) => {
        client.say(target, `" ${row.message} " - ${row.username}`);
    });
}

exports.test = (client, target) => {
    db.all(`SELECT message, username, signature from messages where (signature = '!SAY' OR signature IS NULL) order by timestamp desc limit 1`, (err, row) => {
        console.log(row);
        //client.say(target, `"${row.message}" - ${row.username}`);
    });
}


exports.topThree = (client, target) => {
    queries.getTopThree((err, rows) => {
        let message = `Top three Chatters: `;
        rows.forEach((row, index) => {
            message += `${row.username} (${row.chats})`
            if (index < rows.length - 1) {
                message += ', ';
            }
        });
        client.say(target, message);
    })
}


exports.topThreeMatch = (client, target, search) => {
    queries.getTopThreeMatching(search, (err, rows) => {
        let message = `Top three ${search} : `;
        rows.forEach((row, index) => {
            message += `${row.username} (${row.chats})`
            if (index < rows.length - 1) {
                message += ', ';
            }
        });
        client.say(target, message);
    });
}

exports.timesSaid = (client, target, text) => {
    let username = text.split('|')[0];
    let string = text.split('|')[1];
    queries.getTopMatchingForUser(username, string, (err, row) => {
        console.log(err, row);
    });
}
