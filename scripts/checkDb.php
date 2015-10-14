<?php

require_once('scriptsConfig.php');

use Api\Model\Shared\DbIntegrityHelper;
use Api\Model\ProjectListModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

$runForReal = false;
if (count($argv) > 1 && $argv[1] == 'run') {
    $runForReal = true;
}

$helper = new DbIntegrityHelper($runForReal);

$projectList = new ProjectListModel();
$projectList->read();
foreach ($projectList->entries as $p) {
    $helper->checkProject($p['id']);
    print $helper->flushOutput();
}

print $helper->flushOutput();

// verify integrity of all users

// verify integrity of all sites

// list sites and which projects are in which sites
