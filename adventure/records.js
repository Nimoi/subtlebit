<?php

class Records
{
    public $user;

    /**
     * Player constructor.
     * @param $player
     * @param $user
     */
    public function __construct($user)
    {
        $this->user = $user;
    }

    public function getPlayerRecord() {
        $users = scandir('records');
        if (! in_array($this->user, $users)) {
            return $this->addPlayer();
        }
        return $this->getPlayer();
    }

    public function getUserFilePath() {
        return 'records/'.$this->user;
    }

    public function getFreshPlayer() {
        return [
            'tokens' => 0,
            'wins' => 0,
            'losses' => 0,
            'gear' => [
                'head' => null,
                'weapon' => null,
                'potion' => null
            ],
            'health' => 100
        ];
    }

    public function addPlayer() {
        $player = $this->getFreshPlayer();
        $path = $this->getUserFilePath();
        $this->write($path, json_encode($player));
        return $player;
    }

    public function getPlayer() {
        $path = $this->getUserFilePath();
        return json_decode(file_get_contents($path), true);
    }

    public function savePlayer($player) {
        $path = $this->getUserFilePath();
        $this->write($path, json_encode($player));
    }

    public function write($path, $text) {
        $fp = fopen($path, 'w+');
        fwrite($fp, $text);
        fclose($fp);
    }
}