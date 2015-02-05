<?php
require_once ('e2eTestConfig.php');

use models\ProjectModel;
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
