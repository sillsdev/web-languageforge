<?php

(php_sapi_name() == 'cli') or exit('this script must be run on the command-line');

require_once '../scriptConfig.php';

$scripts = array('FixMultiParagraph.php');

print("\nProject script runner started\n\n");
$projectList = new \Api\Model\Shared\ProjectListModel();
$projectList->read();
foreach ($projectList->entries as $projectParams) {
    foreach ($scripts as $script) {
        $cmd = 'php ./' . $script;
        $output = shell_exec($cmd);
        print($output);
    }
}
print("\nProject script runner finished\n\n");
