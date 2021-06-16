
<?php

include('../bootstrap.php');

function buildDictionary() {
    $text = file_get_contents('../messages.log');
    $text = str_replace(' ', '-', $text);
    $text = str_replace(PHP_EOL, '-', $text);
    $text = strtolower($text);
    $text = preg_replace('/[^A-Za-z0-9\-]/', '', $text);
    $words = explode('-', $text);
    $uniqueWords = collect(array_count_values($words));

    $blacklist = include('words_blacklist.php');
    $uniqueWords = $uniqueWords->filter(function($count, $word) use ($blacklist) {
        if (in_array($word, $blacklist)
            || strpos($word, 'http') === 0
            || is_numeric($word)
            || strlen($word) < 3) {
            return false;
        }
        return true;
    })->sortDesc();

    $uniqueWordString = $uniqueWords->keys()->implode(PHP_EOL);

    $fp = fopen('dictionary.txt', 'w+');
    fwrite($fp, $uniqueWordString);
    fclose($fp);

    echo 'DONE! <br>';
    echo 'Unique words: '. $uniqueWords->count();
}

buildDictionary();
