<?php

require __DIR__ . '/vendor/autoload.php';

use Carbon\Carbon;

class Skill
{
    public $name = 'skilling';
    public $resource = 'skillpoints';
    public $location = 'Dojo';

    /**
     * Skill constructor.
     */
    public function __construct($user, $input, $tokens, $player)
    {
        $this->user = $user;
        $this->input = $input;
        $this->tokens = $tokens;
        $this->player = $player;
        $this->records = new Records($user);
    }

    public function begin()
    {
        if (! array_key_exists('skills', $this->player)
            || ! array_key_exists($this->name, $this->player['skills'])) {
            $this->setup();
            return;
        }

        echo '/me $user started '.$this->name.' '.$this->timeSinceStart()
            .' in the '.$this->player['skills'][$this->name]['place']
            .'. They have collected '.$this->getResource().' '.$this->resource.'.';
    }

    private function setup()
    {
        if (! array_key_exists('skills', $this->player)) {
            $this->player['skills'] = [];
        }
        $this->player['skills'][$this->name] = [
            'started_at' => Carbon::now()->toDateTimeString(),
            'place' => $this->location.' of '.getRandomWord()
        ];
        $this->records->savePlayer($this->player);
        echo '/me $user begins '.$this->name.' in the '.$this->player['skills'][$this->name]['place'].'.';
    }

    private function getResource()
    {
        return $this->secondsSinceStart() / 10;
    }

    private function parseTimestamp()
    {
        return Carbon::createFromTimeStamp(
            strtotime($this->player['skills'][$this->name]['started_at'])
        );
    }

    private function secondsSinceStart()
    {
        return $this->parseTimestamp()->diffInSeconds();
    }

    private function timeSinceStart()
    {
        return $this->parseTimestamp()->diffForHumans();
    }
}
