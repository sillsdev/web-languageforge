<?php
require_once ('e2eTestConfig.php');

use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\commands\LexUploadCommands;

$constants = json_decode(file_get_contents(TestPath . '/testConstants.json'), true);

if ($constants['siteType'] == 'languageforge') {

    // cleanup test assets folder
    $testProject = new LexiconProjectModel();
    $testProject->readByProperties(array(
        'projectCode' => $constants['testProjectCode']
    ));
    $assetsFolderPath = $testProject->getAssetsFolderPath();
    recursiveRemoveFolder($assetsFolderPath);
}

function recursiveRemoveFolder($folder)
{
    foreach (glob("{$folder}/*") as $file) {
        if (is_dir($file)) {
            recursiveRemoveFolder($file);
        } else {
            unlink($file);
        }
    }
    rmdir($folder);
}