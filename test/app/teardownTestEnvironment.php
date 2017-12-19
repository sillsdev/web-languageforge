<?php

require_once ('e2eTestConfig.php');

use Api\Model\Shared\ProjectModel;

$constants = json_decode(file_get_contents(TestPath . 'app/testConstants.json'), true);

// delete test projects (including asset folders and s/r folders)
$projectCodeHandles = ['testProjectCode', 'otherProjectCode', 'thirdProjectCode',
    'fourthProjectCode', 'newProjectCode', 'emptyProjectCode', 'srProjectCode'];
foreach ($projectCodeHandles as $handle) {
    $project = ProjectModel::getByProjectCode($constants[$handle]);
    if ($project->hasId()) {
        $project->remove();
        echo "Removed '${constants[$handle]}'";
    }
}

// cleanup mocked uploaded/imported files
$mockFiles = ['testMockJpgImportFile', 'testMockZipImportFile', 'testMockPngUploadFile', 'testMockMp3UploadFile'];
foreach ($mockFiles as $file) {
    $tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $constants[$file]['name'];
    @unlink($tmpFilePath);
}
