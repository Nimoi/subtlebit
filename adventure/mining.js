const Skill = require('./skill.js');

/**
 * Ideas
 * Store timestamp last time command was run
 * Get seconds since last time command was run, use as chances to find gems
 * Multipliers for stones and chance to find gems
 * Mines have levels, mine x stones to advance to the next level
 * New mine levels have different / better ores
 * Use ores to forge weapons
 */

class Mining extends Skill
{
    constructor() {
        super();
        this.name = 'mining';
        this.resource = 'stones';
        this.location = 'Mines';
    }
}

exports.default = Mining;
