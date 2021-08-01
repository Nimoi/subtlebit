const datetime = require('./datetime');

class Skill
{
    constructor(client) {
        this.name = 'skilling';
        this.resource = 'skillpoints';
        this.location = 'Dojo';

        this.user = $user;
        this.input = $input;
        this.tokens = $tokens;
        this.player = $player;
        this.records = new Records($user);

        this.client = client;
    }

    begin()
    {
        if (! array_key_exists('skills', this.player)
            || ! array_key_exists(this.name, this.player['skills'])) {
            this.setup();
            return;
        }

        this.client.say('/me $user started '+this.name+' '+this.timeSinceStart()
            +' in the '+this.player['skills'][this.name]['place']
            +'. They have collected '+this.getResource()+' '+this.resource+'.');
    }

    setup()
    {
        if (! array_key_exists('skills', this.player)) {
            this.player['skills'] = [];
        }
        this.player['skills'][this.name] = {
            started_at: datetime.formatedTimestamp(),
            place: this.location+' of '+getRandomWord()
        };
        this.records.savePlayer(this.player);
        this.client.say('/me $user begins '+this.name+' in the '+this.player['skills'][this.name]['place']+'.');
    }

    getResource()
    {
        return this.secondsSinceStart() / 10;
    }

    parseTimestamp()
    {
        // TODO: fix
        //return Carbon::createFromTimeStamp(
            //strtotime(this.player['skills'][this.name]['started_at'])
        //);
    }

    secondsSinceStart()
    {
        // TODO: fix
        //return this.parseTimestamp()->diffInSeconds();
    }

    timeSinceStart()
    {
        // TODO: fix
        //return this.parseTimestamp()->diffForHumans();
    }
}

exports.default = Skill;
