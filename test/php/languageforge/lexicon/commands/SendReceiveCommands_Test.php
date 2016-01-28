<?php

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Languageforge\Lexicon\LexiconProjectModelWithSRPassword;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;
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
        $project->sendReceiveProject = new SendReceiveProjectModel('test-eb-sena3-flex', 'ihopkinson', 'h&0#Z0awvjfm', 'manager');
        $projectId = $project->write();
        $queueType = 'receive';

        SendReceiveCommands::queueProjectForReceive($projectId);
        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType);

        $this->assertTrue($isRunning);
    }
*/
    public function testSaveCredentials_ProjectAndUser_CredentialsSaved()
    {
        $userId = $this->environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::MANAGER);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $username = 'sr_user';
        $password = 'sr_pass';
        $srProject = JsonEncoder::encode($sendReceiveProject);

        $newProjectId = SendReceiveCommands::saveCredentials($projectId, $srProject, $username, $password);

        $newProject = new LexiconProjectModelWithSRPassword($newProjectId);
        $this->assertEqual($newProjectId, $projectId);
        $this->assertEqual($newProject->sendReceiveProject, $sendReceiveProject);
        $this->assertEqual($newProject->sendReceiveUsername, $username);
        $this->assertEqual($newProject->sendReceivePassword, $password);
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

    public function testGetUserProjects_KnownUser_UserKnown()
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

    public function testGetUserProjects_InvalidPass_PassInvalid()
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
        $body = Stream::factory('[{"identifier": "identifier2", "name": "name2", "repository": "", "role": ""}, {"identifier": "identifier1", "name": "name1", "repository": "", "role": ""}]');
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);
        $mock = new Mock([$response]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result['isKnownUser'], true);
        $this->assertEqual($result['hasValidCredentials'], true);
        $this->assertEqual(count($result['projects']), 2);
        $this->assertEqual($result['projects'][0]['name'], 'name1');
        $this->assertEqual($result['projects'][1]['name'], 'name2');
    }

    public function testGetUserProjects_2ProjectsDuplicateIdentifiersBeginCase_RepoClarification()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $body = Stream::factory('[{"identifier": "identifier", "name": "name2", "repository": "http://public.languagedepot.org", "role": ""}, {"identifier": "identifier", "name": "name1", "repository": "http://private.languagedepot.org", "role": ""}]');
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
        $body = Stream::factory('[{"identifier": "identifier", "name": "name2", "repository": "http://private.languagedepot.org", "role": ""}, {"identifier": "identifier", "name": "name1", "repository": "http://public.languagedepot.org", "role": ""}]');
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

    public function testQueueProjectForUpdate_NoSendReceive_NoAction()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mockMergeQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';
        FileUtilities::createAllFolders($mockMergeQueuePath);

        $filename = SendReceiveCommands::queueProjectForUpdate($project, $mockMergeQueuePath);

        $queueFileNames = scandir($mockMergeQueuePath);
        $this->assertFalse($filename);
        $this->assertEqual(count($queueFileNames), 2);
    }

    public function testQueueProjectForUpdate_HasSendReceive_QueueFileCreated()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $project->write();
        $mockMergeQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';

        $filename = SendReceiveCommands::queueProjectForUpdate($project, $mockMergeQueuePath);

        $queueFileNames = scandir($mockMergeQueuePath);
        $this->assertPattern('/' . $project->projectCode . '/', $filename);
        $this->assertEqual(count($queueFileNames), 3);
        FileUtilities::removeFolderAndAllContents($mockMergeQueuePath);
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
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $queueType = 'merge';
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $mockCommand = 'mockLFMerge.exe';

        $this->expectException(new \Exception('LFMerge is not installed. Contact the website administrator.'));
        $this->environ->inhibitErrorDisplay();
        SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType, $mockPidFilePath, $mockCommand);

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
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $queueType = 'merge';
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $runSeconds = 2;
        $mockCommand = 'php ' . __DIR__ . '/mockLFMergeExe.php ' . $runSeconds;

        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType, $mockPidFilePath, $mockCommand);

        $this->assertTrue($isRunning);
        sleep(1);
        $this->assertTrue(SendReceiveCommands::isProcessRunningByPidFile($mockPidFilePath));

        $isStillRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType, $mockPidFilePath, $mockCommand);

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
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertFalse($status);
    }

    public function testGetProjectStatus_HasSendReceiveAndStateFileNotJson_NoException()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . '/' . $project->projectCode . '.state';
        file_put_contents($projectStatePath, 'state: IDLE');

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertFalse($status);

        unlink($projectStatePath);
    }

    public function testGetProjectStatus_HasSendReceiveAndIdleStateFile_IdleState()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . '/' . $project->projectCode . '.state';
        file_put_contents($projectStatePath, '{"state": "IDLE"}');

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertEqual($status['state'], 'IDLE');

        unlink($projectStatePath);
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
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
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
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $project->write();

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationSendRequest_HasSendReceiveAndNoUncommittedEntries_NoAction()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
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
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . '/' . $project->projectCode . '.state';
        file_put_contents($projectStatePath, '{"state": "SENDING", "uncommittedEditCount": 1}');
        $mockSendQueuePath = sys_get_temp_dir() . '/mockReceiveQueue';
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $mockCommand = 'php ' . __DIR__ . '/mockLFMergeExe.php';

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode, $mockStatePath, $mockSendQueuePath, $mockPidFilePath, $mockCommand);

        $queueFileNames = scandir($mockSendQueuePath);
        $this->assertTrue($isNotified);
        $this->assertEqual(count($queueFileNames), 3);
        FileUtilities::removeFolderAndAllContents($mockSendQueuePath);
        unlink($projectStatePath);
    }
}
