<?php

# Read each record file, 
$path = '/web/subtlebit/adventure/records';
$results = [];
foreach(scandir($path) as $file) {
    if (in_array($file, ['.', '..'], true)) {
        continue;
    }
    $record = file_get_contents($path.'/'.$file);
    $results[$file] = json_decode($record);
}

echo json_encode($results);
