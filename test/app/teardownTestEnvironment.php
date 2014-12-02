<?php
require_once ('e2eTestConfig.php');

use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\commands\LexUploadCommands;
use Palaso\Utilities\FileUtilities;

$constants = json_decode(file_get_contents(TestPath . '/testConstants.json'), true);

if ($constants['siteType'] == 'languageforge') {

    // cleanup test assets folder
    $testProject = new LexiconProjectModel();
    $testProject->readByProperties(array(
        'projectCode' => $constants['testProjectCode']
    ));
    $assetsFolderPath = $testProject->getAssetsFolderPath();
    FileUtilities::removeFolderAndAllContents($assetsFolderPath);

    // cleanup mocked uploaded zip import (jpg file)
    $tmpFilePath = sys_get_temp_dir() . '/' . $constants['testMockJpgImportFile']['name'];
    @unlink($tmpFilePath);

    // cleanup mocked uploaded zip import (zip file)
    $tmpFilePath = sys_get_temp_dir() . '/' . $constants['testMockZipImportFile']['name'];
    @unlink($tmpFilePath);
}
