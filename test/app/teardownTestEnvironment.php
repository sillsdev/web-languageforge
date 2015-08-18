<?php
require_once ('e2eTestConfig.php');

use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Languageforge\Lexicon\Command\LexUploadCommands;
use Api\Model\ProjectModel;
use Palaso\Utilities\FileUtilities;

$constants = json_decode(file_get_contents(TestPath . '/testConstants.json'), true);

// cleanup test assets folder
$project = new ProjectModel();
$project->readByProperties(array(
    'projectCode' => $constants['testProjectCode']
));
$testProject = $project->getById($project->id->asString());
$assetsFolderPath = $testProject->getAssetsFolderPath();
FileUtilities::removeFolderAndAllContents($assetsFolderPath);

// cleanup mocked uploaded zip import (jpg file)
$tmpFilePath = sys_get_temp_dir() . '/' . $constants['testMockJpgImportFile']['name'];
@unlink($tmpFilePath);

// cleanup mocked uploaded zip import (zip file)
$tmpFilePath = sys_get_temp_dir() . '/' . $constants['testMockZipImportFile']['name'];
@unlink($tmpFilePath);
