<?php

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Mapper\JsonEncoder;
use GuzzleHttp\Client;
use GuzzleHttp\Message\Response;
use GuzzleHttp\Stream\Stream;
use GuzzleHttp\Subscriber\Mock;
use Palaso\Utilities\FileUtilities;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestSendReceiveCommands extends UnitTestCase
{
    public function __construct() {
        $this->environ = new LexiconMongoTestEnvironment();
        $this->environ->clean();
        parent::__construct();
    }

    /**
     * Local store of mock test environment
     *
     * @var LexiconMongoTestEnvironment
     */
    private $environ;
/*
    public function testGetUserProjectsActualApi_ValidCredentials_CredentialsValid()
    {
        $username = 'change to your username';
        $password = 'change to your password';

        $result = SendReceiveCommands::getUserProjects($username, $password);
//        var_dump($result);
        var_dump($result->projects);

        $this->assertEqual($result->isKnownUser, true);
        $this->assertEqual($result->hasValidCredentials, true);
    }

    public function testShellExec_LfMergeHelp()
    {
        $output = shell_exec("lfmerge -h 2>&1");
        var_dump($output);
    }

    public function testShellExec_LfMergeHickenplatt()
    {
        $projectCode = 'hickenplatt';
        $statePath = SendReceiveCommands::getLFMergePaths()->statePath .DIRECTORY_SEPARATOR.$projectCode.'.state';
        if (file_exists($statePath)) unlink($statePath);

        $receiveQueueFilePath = SendReceiveCommands::getLFMergePaths()->receiveQueuePath .DIRECTORY_SEPARATOR.$projectCode;
        if (!file_put_contents($receiveQueueFilePath, 'projectCode: '.$projectCode)) return;

        $output = shell_exec('lfmerge -q receive -p '.$projectCode.' 2>&1');
        var_dump($output);

        $pidFilePath = sys_get_temp_dir() . '/run/lfmerge.pid';
        $isRunning = SendReceiveCommands::isProcessRunningByPidFile($pidFilePath);
        $this->assertFalse($isRunning);
    }

    public function testStartLFMergeIfRequiredActual_HasSendReceiveButNoPidFile_Started()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'test-eb-sena3-flex';
        $project->sendReceiveProject = new SendReceiveProjectModel('change to your username', 'change to your password', 'manager');
        $projectId = $project->write();
        $queueType = 'receive';

        SendReceiveCommands::queueProjectForSync($projectId);
        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType);

        $this->assertTrue($isRunning);
    }
*/
    public function testUpdateSRProject_ProjectAndUser_SRProjectSaved()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $srProject = JsonEncoder::encode($sendReceiveProject);
        $srProject['identifier'] = 'sr_id';

        $newProjectId = SendReceiveCommands::updateSRProject($projectId, $srProject);

        $newProject = new LexProjectModel($newProjectId);
        $this->assertEqual($newProjectId, $projectId);
        $this->assertEqual($newProject->sendReceiveProject, $sendReceiveProject);
        $this->assertEqual($newProject->sendReceiveProjectIdentifier, $srProject['identifier']);
    }

    public function testGetUserProjects_BlankCredentials_CredentialsInvalid()
    {
        $username = '';
        $password = '';
        $client = new Client();

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], false);
        $this->assertEqual($result['hasValidCredentials'], false);
        $this->assertEqual(count($result['projects']), 0);
    }

    public function testGetUserProjects_KnownUserInvalidPass_UserKnownPassInvalid()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $mock = new Mock([new Response(403)]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], true);
        $this->assertEqual($result['hasValidCredentials'], false);
        $this->assertEqual(count($result['projects']), 0);
    }

    public function testGetUserProjects_UnknownUser_UserUnknown()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $mock = new Mock([new Response(404)]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], false);
        $this->assertEqual($result['hasValidCredentials'], false);
        $this->assertEqual(count($result['projects']), 0);
    }

    public function testGetUserProjects_ValidCredentials_CredentialsValid()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $body = Stream::factory('[{"identifier": "identifier1", "name": "name", "repository": "", "role": ""}]');
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);
        $mock = new Mock([$response]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], true);
        $this->assertEqual($result['hasValidCredentials'], true);
        $this->assertEqual(count($result['projects']), 1);
    }

    public function testGetUserProjects_2Projects_SortedByName()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $body = Stream::factory('[{"identifier": "identifier2", "name": "name2", "repository": "", "role": ""}, '.
            '{"identifier": "identifier1", "name": "name1", "repository": "", "role": ""}]');
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);
        $mock = new Mock([$response]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], true);
        $this->assertEqual($result['hasValidCredentials'], true);
        $this->assertEqual(count($result['projects']), 2);
        $this->assertEqual($result['projects'][0]['name'], 'name1');
        $this->assertEqual($result['projects'][1]['name'], 'name2');
        $this->assertEqual($result['projects'][0]['identifier'], 'identifier1');
    }

    public function testGetUserProjects_2ProjectsDuplicateIdentifiersBeginCase_RepoClarification()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $body = Stream::factory('[{"identifier": "identifier", "name": "name2", '.
            '"repository": "http://public.languagedepot.org", "role": ""}, '.
            '{"identifier": "identifier", "name": "name1", "repository": '.
            '"http://private.languagedepot.org", "role": ""}]');
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);
        $mock = new Mock([$response]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], true);
        $this->assertEqual($result['hasValidCredentials'], true);
        $this->assertEqual(count($result['projects']), 2);
        $this->assertEqual($result['projects'][0]['name'], 'name1');
        $this->assertEqual($result['projects'][0]['repoClarification'], 'private');
        $this->assertEqual($result['projects'][1]['name'], 'name2');
        $this->assertEqual($result['projects'][1]['repoClarification'], '');
    }

    public function testGetUserProjects_2ProjectsDuplicateIdentifiersEndCase_RepoClarification()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $body = Stream::factory('[{"identifier": "identifier", "name": "name2", "repository": '.
            '"http://private.languagedepot.org", "role": ""}, '.
            '{"identifier": "identifier", "name": "name1", '.
            '"repository": "http://public.languagedepot.org", "role": ""}]');
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);
        $mock = new Mock([$response]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], true);
        $this->assertEqual($result['hasValidCredentials'], true);
        $this->assertEqual(count($result['projects']), 2);
        $this->assertEqual($result['projects'][0]['name'], 'name1');
        $this->assertEqual($result['projects'][0]['repoClarification'], '');
        $this->assertEqual($result['projects'][1]['name'], 'name2');
        $this->assertEqual($result['projects'][1]['repoClarification'], 'private');
    }

    public function testGetUserProjects_TwoSRProjectsOneExistingLFProject_ProjectExists()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $body = Stream::factory('[{"identifier": "identifier", "name": "name2", "repository": "", "role": ""}, '.
            '{"identifier": "sr_id", "name": "sr_name", "repository": "", "role": ""}]');
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);
        $mock = new Mock([$response]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], true);
        $this->assertEqual($result['hasValidCredentials'], true);
        $this->assertEqual(count($result['projects']), 2);
        $this->assertEqual($result['projects'][0]['isLinked'], false);
        $this->assertEqual($result['projects'][1]['isLinked'], true);
        $this->assertEqual($result['projects'][1]['name'], 'sr_name');
    }

    public function testQueueProjectForEdit_NoSendReceive_NoAction()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $mockEditQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';
        FileUtilities::createAllFolders($mockEditQueuePath);

        $filename = SendReceiveCommands::queueProjectForEdit($projectId, $mockEditQueuePath);

        $queueFileNames = scandir($mockEditQueuePath);
        $this->assertFalse($filename);
        $this->assertEqual(count($queueFileNames), 2);
    }

    public function testQueueProjectForEdit_HasSendReceive_QueueFileCreated()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockEditQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';

        $filename = SendReceiveCommands::queueProjectForEdit($projectId, $mockEditQueuePath);

        $queueFileNames = scandir($mockEditQueuePath);
        $this->assertPattern('/' . $project->projectCode . '/', $filename);
        $this->assertEqual(count($queueFileNames), 3);
        FileUtilities::removeFolderAndAllContents($mockEditQueuePath);
    }

    public function testIsProcessRunningByPidFile_NoPidFile_NotRunning()
    {
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';

        $isRunning = SendReceiveCommands::isProcessRunningByPidFile($mockPidFilePath);

        $this->assertFalse($isRunning);
    }

    public function testIsProcessRunningByPidFile_NoProcess_NotRunning()
    {
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $pid = 1;
        file_put_contents($mockPidFilePath, $pid);

        $isRunning = SendReceiveCommands::isProcessRunningByPidFile($mockPidFilePath);

        $this->assertFalse($isRunning);
        unlink($mockPidFilePath);
    }

    public function testStartLFMergeIfRequired_NoSendReceive_NoAction()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId);

        $this->assertFalse($isRunning);
    }

    public function testStartLFMergeIfRequired_HasSendReceiveButNoLFMergeExe_Exception()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $mockCommand = 'mockLFMerge.exe';

        $this->expectException(new \Exception('LFMerge is not installed. Contact the website administrator.'));
        $this->environ->inhibitErrorDisplay();
        SendReceiveCommands::startLFMergeIfRequired($projectId, $mockPidFilePath, $mockCommand);

        // nothing runs in the current test function after an exception. IJH 2015-12
    }

    public function testStartLFMergeIfRequired_HasSendReceiveButNoLFMergeExe_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }

    public function testStartLFMergeIfRequired_HasSendReceiveButNoPidFile_Started()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $runSeconds = 2;
        $mockCommand = 'php ' . __DIR__ . '/mockLFMergeExe.php ' . $runSeconds;

        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $mockPidFilePath, $mockCommand);

        $this->assertTrue($isRunning);
        sleep(1);
        $this->assertTrue(SendReceiveCommands::isProcessRunningByPidFile($mockPidFilePath));

        $isStillRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $mockPidFilePath, $mockCommand);

        $this->assertTrue($isStillRunning);
    }

    public function testGetProjectStatus_NoSendReceive_NoState()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $status = SendReceiveCommands::getProjectStatus($projectId);

        $this->assertFalse($status);
    }

    public function testGetProjectStatus_HasSendReceiveNoStateFile_NoState()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertFalse($status);
    }

    public function testGetProjectStatus_HasSendReceiveAndStateFileNotJson_NoException()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . '/' . $project->projectCode . '.state';
        file_put_contents($projectStatePath, '{"SRState": "IDLE"}');

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertFalse($status);

        unlink($projectStatePath);
    }

    public function testGetProjectStatus_HasSendReceiveAndIdleStateFile_IdleState()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . DIRECTORY_SEPARATOR . strtolower($project->projectCode) . '.state';
        file_put_contents($projectStatePath, '{"SRState": "IDLE"}');

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertEqual($status['SRState'], 'IDLE');

        unlink($projectStatePath);
    }

    public function testGetProjectStatus_HasSendReceiveAndInQueue_PendingState()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();

        // Create test queue directories
        $tmpTestPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'pendingStateTest';
        $lfMergePaths = SendReceiveCommands::getLFMergePaths(true, $tmpTestPath);
        $projectStatePath = $lfMergePaths->statePath . DIRECTORY_SEPARATOR . strtolower($project->projectCode) . '.state';
        FileUtilities::createAllFolders($tmpTestPath);
        FileUtilities::createAllFolders($lfMergePaths->mergeQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->receiveQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->sendQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->editQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->syncQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->statePath);

        $mockQueuePath = $lfMergePaths->syncQueuePath;
        SendReceiveCommands::queueProjectForSync($projectId, $mockQueuePath);
        file_put_contents($projectStatePath, '{"SRState": "IDLE"}');
        $status = SendReceiveCommands::getProjectStatus($projectId, $lfMergePaths->statePath);
        $this->assertEqual($status['SRState'], 'PENDING');
        FileUtilities::removeFolderAndAllContents($mockQueuePath);

        $mockQueuePath = $lfMergePaths->editQueuePath;
        SendReceiveCommands::queueProjectForEdit($projectId, $mockQueuePath);
        file_put_contents($projectStatePath, '{"SRState": "IDLE"}');
        $status = SendReceiveCommands::getProjectStatus($projectId, $lfMergePaths->statePath);
        $this->assertEqual($status['SRState'], 'PENDING');
        FileUtilities::removeFolderAndAllContents($mockQueuePath);

        FileUtilities::removeFolderAndAllContents($tmpTestPath);
    }

    public function testGetProjectStatus_HasSendReceiveAndSyncing_SyncingState()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();

        // Create test queue directories
        $tmpTestPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'pendingStateTest';
        $lfMergePaths = SendReceiveCommands::getLFMergePaths(true, $tmpTestPath);
        $projectStatePath = $lfMergePaths->statePath . DIRECTORY_SEPARATOR . strtolower($project->projectCode) . '.state';
        FileUtilities::createAllFolders($tmpTestPath);
        FileUtilities::createAllFolders($lfMergePaths->mergeQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->receiveQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->sendQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->editQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->syncQueuePath);
        FileUtilities::createAllFolders($lfMergePaths->statePath);

        $mockQueuePath = $lfMergePaths->syncQueuePath;
        SendReceiveCommands::queueProjectForSync($projectId, $mockQueuePath);
        file_put_contents($projectStatePath, '{"SRState": "SYNCING"}');
        $status = SendReceiveCommands::getProjectStatus($projectId, $lfMergePaths->statePath);
        $this->assertEqual($status['SRState'], 'SYNCING');
        FileUtilities::removeFolderAndAllContents($mockQueuePath);

        $mockQueuePath = $lfMergePaths->editQueuePath;
        SendReceiveCommands::queueProjectForEdit($projectId, $mockQueuePath);
        file_put_contents($projectStatePath, '{"SRState": "SYNCING"}');
        $status = SendReceiveCommands::getProjectStatus($projectId, $lfMergePaths->statePath);
        $this->assertEqual($status['SRState'], 'SYNCING');
        FileUtilities::removeFolderAndAllContents($mockQueuePath);

        FileUtilities::removeFolderAndAllContents($tmpTestPath);
    }

    public function testNotificationReceiveRequest_NonExistentProjectCode_NoAction()
    {
        $projectCode = 'non-existent-projectCode';

        $isNotified = SendReceiveCommands::notificationReceiveRequest($projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationReceiveRequest_NoSendReceive_NoAction()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $isNotified = SendReceiveCommands::notificationReceiveRequest($project->projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationReceiveRequest_HasSendReceive_QueueFileCreated()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $project->write();
        $mockReceiveQueuePath = sys_get_temp_dir() . '/mockReceiveQueue';
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $mockCommand = 'php ' . __DIR__ . '/mockLFMergeExe.php';

        $isNotified = SendReceiveCommands::notificationReceiveRequest($project->projectCode, $mockReceiveQueuePath, $mockPidFilePath, $mockCommand);

        $queueFileNames = scandir($mockReceiveQueuePath);
        $this->assertTrue($isNotified);
        $this->assertEqual(count($queueFileNames), 3);
        FileUtilities::removeFolderAndAllContents($mockReceiveQueuePath);
    }

    public function testNotificationSendRequest_NonExistentProjectCode_NoAction()
    {
        $projectCode = 'non-existent-projectCode';

        $isNotified = SendReceiveCommands::notificationSendRequest($projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationSendRequest_NoSendReceive_NoAction()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationSendRequest_HasSendReceive_NoAction()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $project->write();

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationSendRequest_HasSendReceiveAndNoUncommittedEntries_NoAction()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . '/' . $project->projectCode . '.state';
        file_put_contents($projectStatePath, '{"state": "IDLE", "uncommittedEditCount": 0}');

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode, $mockStatePath);

        $this->assertFalse($isNotified);
        unlink($projectStatePath);
    }

    public function testNotificationSendRequest_HasSendReceiveAndHasUncommittedEntry_Notified()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $project->write();
        $tmpTestPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'notifiedTest';
        $lfmergePaths = SendReceiveCommands::getLFMergePaths(true, $tmpTestPath);
        $projectStatePath = $lfmergePaths->statePath . DIRECTORY_SEPARATOR . strtolower($project->projectCode) . '.state';
        FileUtilities::createAllFolders($tmpTestPath);
        FileUtilities::createAllFolders($lfmergePaths->sendQueuePath);
        FileUtilities::createAllFolders($lfmergePaths->statePath);
        file_put_contents($projectStatePath, '{"state": "SENDING", "uncommittedEditCount": 1}');

        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $mockCommand = 'php ' . __DIR__ . '/mockLFMergeExe.php';

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode, $lfmergePaths->statePath, $lfmergePaths->sendQueuePath, $mockPidFilePath, $mockCommand);

        $queueFileNames = scandir($lfmergePaths->sendQueuePath);
        $this->assertTrue($isNotified);
        $this->assertEqual(count($queueFileNames), 3);
        FileUtilities::removeFolderAndAllContents($tmpTestPath);
    }
}
