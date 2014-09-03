<?php
use models\scriptureforge\sfchecks\commands\SfchecksUploadCommands;
use models\TextModel;

require_once (dirname(__FILE__) . '/../../TestConfig.php');
require_once (SimpleTestPath . 'autorun.php');
require_once (TestPath . 'common/MongoTestEnvironment.php');

class TestSfchecksUploadCommands extends UnitTestCase
{

    function testUploadAudio_mp3File_uploadAllowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        $fileType = 'audio';
        $file = array();
        $file['name'] = 'fileName.mp3';
        $file['type'] = 'audio/mp3';
        $file['tmp_name'] = '';
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, $fileType);

        $this->assertEqual($response->result, true);
    }
}

?>
