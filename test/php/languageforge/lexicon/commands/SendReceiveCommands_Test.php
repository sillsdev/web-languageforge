<?php

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
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
*/
    public function testSaveCredentials_ProjectAndUser_CredentialsSaved()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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

        $this->assertEqual($result->isKnownUser, false);
        $this->assertEqual($result->hasValidCredentials, false);
        $this->assertEqual($result->projects->count(), 0);
    }

    public function testGetUserProjects_KnownUser_UserKnown()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $mock = new Mock([new Response(403)]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result->isKnownUser, true);
        $this->assertEqual($result->hasValidCredentials, false);
        $this->assertEqual($result->projects->count(), 0);
    }

    public function testGetUserProjects_UnknownUser_UserUnknown()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $mock = new Mock([new Response(404)]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result->isKnownUser, false);
        $this->assertEqual($result->hasValidCredentials, false);
        $this->assertEqual($result->projects->count(), 0);
    }

    public function testGetUserProjects_InvalidPass_PassInvalid()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $client = new Client();
        $mock = new Mock([new Response(403)]);
        $client->getEmitter()->attach($mock);

        $result = SendReceiveCommands::getUserProjects($username, $password, $client);

        $this->assertEqual($result->isKnownUser, true);
        $this->assertEqual($result->hasValidCredentials, false);
        $this->assertEqual($result->projects->count(), 0);
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

        $this->assertEqual($result->isKnownUser, true);
        $this->assertEqual($result->hasValidCredentials, true);
        $this->assertTrue($result->projects->count() > 0);
    }

    public function testQueueProjectForUpdate_NoSendReceive_NoAction()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mockMergeQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';
        FileUtilities::createAllFolders($mockMergeQueuePath);

        $filename = SendReceiveCommands::queueProjectForUpdate($project, $mockMergeQueuePath);

        $queueFileNames = scandir($mockMergeQueuePath);
        $this->assertFalse($filename);
        $this->assertEqual(count($queueFileNames), 2);
    }

    public function testQueueProjectForUpdate_HasSendReceive_QueueFileCreated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $pidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';

        $isRunning = SendReceiveCommands::isProcessRunningByPidFile($pidFilePath);

        $this->assertFalse($isRunning);
    }

    public function testIsProcessRunningByPidFile_NoProcess_NotRunning()
    {
        $pidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $pid = 1;
        file_put_contents($pidFilePath, $pid);

        $isRunning = SendReceiveCommands::isProcessRunningByPidFile($pidFilePath);

        $this->assertFalse($isRunning);
        unlink($pidFilePath);
    }

    public function testStartLFMergeIfRequired_NoSendReceive_NoAction()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId);

        $this->assertFalse($isRunning);
    }

    public function testStartLFMergeIfRequired_HasSendReceiveButNoLFMergeExe_Exception()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $queueType = 'merge';
        $pidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $command = 'mockLFMerge.exe';

        $this->expectException(new \Exception('LFMerge is not installed. Contact the website administrator.'));
        $e->inhibitErrorDisplay();
        SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType, $pidFilePath, $command);

        // nothing runs in the current test function after an exception. IJH 2015-12
    }

    public function testStartLFMergeIfRequired_HasSendReceiveButNoPidFile_Started()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $queueType = 'merge';
        $pidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $runSeconds = 3;
        $command = 'php mockLFMergeExe.php ' . $runSeconds;

        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType, $pidFilePath, $command);

        $this->assertTrue($isRunning);
        sleep(1);
        $this->assertTrue(SendReceiveCommands::isProcessRunningByPidFile($pidFilePath));
        sleep(1);

        $isStillRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $queueType, $pidFilePath, $command);

        $this->assertTrue($isStillRunning);
    }
}
