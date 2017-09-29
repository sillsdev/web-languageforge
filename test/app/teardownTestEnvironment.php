<?php

require_once ('e2eTestConfig.php');

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\ProjectModel;
use Palaso\Utilities\FileUtilities;

$constants = json_decode(file_get_contents(TestPath . 'app/testConstants.json'), true);

// cleanup test assets folder
$project = new ProjectModel();
$project->readByProperties(array(
    'projectCode' => $constants['testProjectCode']
));
$testProject = ProjectModel::getById($project->id->asString());
$assetsFolderPath = $testProject->getAssetsFolderPath();
FileUtilities::removeFolderAndAllContents($assetsFolderPath);

// cleanup other assets folders
$otherAssetsFolderPath = str_replace($constants['testProjectCode'], $constants['otherProjectCode'], $assetsFolderPath);
FileUtilities::removeFolderAndAllContents($otherAssetsFolderPath);
$otherAssetsFolderPath = str_replace($constants['testProjectCode'], $constants['thirdProjectCode'], $assetsFolderPath);
FileUtilities::removeFolderAndAllContents($otherAssetsFolderPath);
$otherAssetsFolderPath = str_replace($constants['testProjectCode'], $constants['fourthProjectCode'], $assetsFolderPath);
FileUtilities::removeFolderAndAllContents($otherAssetsFolderPath);
$otherAssetsFolderPath = str_replace($constants['testProjectCode'], $constants['newProjectCode'], $assetsFolderPath);
FileUtilities::removeFolderAndAllContents($otherAssetsFolderPath);
$otherAssetsFolderPath = str_replace($constants['testProjectCode'], $constants['emptyProjectCode'], $assetsFolderPath);
FileUtilities::removeFolderAndAllContents($otherAssetsFolderPath);
$otherAssetsFolderPath = str_replace($constants['testProjectCode'], $constants['srProjectCode'], $assetsFolderPath);
FileUtilities::removeFolderAndAllContents($otherAssetsFolderPath);
$otherAssetsFolderPath = str_replace($constants['testProjectCode'], 'mock-id4', $assetsFolderPath);
if (file_exists($otherAssetsFolderPath)) {
    // glob doesn't list broken links, manually remove them first
    foreach (array_diff(scandir($otherAssetsFolderPath), array('.', '..')) as $filename) {
        $filePath = $otherAssetsFolderPath . DIRECTORY_SEPARATOR . $filename;
        if (is_link($filePath)) {
            unlink($filePath);
        }
    }
    FileUtilities::removeFolderAndAllContents($otherAssetsFolderPath);
}

// cleanup LfMerge 'syncqueue', 'webwork' and 'state' folders
if ($testProject->appName == LexProjectModel::LEXICON_APP) {
    $syncQueuePath = SendReceiveCommands::getLFMergePaths()->syncQueuePath;
    foreach (glob("{$syncQueuePath}/*") as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    $workPath = SendReceiveCommands::getLFMergePaths()->workPath;
    FileUtilities::removeFolderAndAllContents($workPath . DIRECTORY_SEPARATOR . $constants['srProjectCode']);
    FileUtilities::removeFolderAndAllContents($workPath . DIRECTORY_SEPARATOR . 'mock-id4');
    $stateFilePath = SendReceiveCommands::getLFMergePaths()->statePath . DIRECTORY_SEPARATOR . 'mock-id4.state';
    if (is_file($stateFilePath)) {
        unlink($stateFilePath);
    }
}

// cleanup mocked uploaded zip import (jpg file)
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $constants['testMockJpgImportFile']['name'];
@unlink($tmpFilePath);

// cleanup mocked uploaded zip import (zip file)
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $constants['testMockZipImportFile']['name'];
@unlink($tmpFilePath);

// cleanup mock uploaded audio (png file)
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $constants['testMockPngUploadFile']['name'];
@unlink($tmpFilePath);

// cleanup mock uploaded audio (mp3 file)
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $constants['testMockMp3UploadFile']['name'];
@unlink($tmpFilePath);
