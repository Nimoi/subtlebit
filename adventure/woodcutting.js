<?php

require __DIR__ . '/vendor/autoload.php';

use Carbon\Carbon;

class WoodCutting extends Skill
{
    public $name = 'woodcutting';
    public $resource = 'logs';
    public $location = 'Forest';
}
