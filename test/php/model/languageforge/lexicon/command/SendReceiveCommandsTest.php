<?php

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Shared\Mapper\JsonEncoder;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\MiddleWare;
use GuzzleHttp\Psr7\Response;
use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\FileUtilities;
use PHPUnit\Framework\TestCase;

class SendReceiveCommandsTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
    }
/*
    public function testGetUserProjectsActualApi_ValidCredentials_CredentialsValid()
    {
        $username = 'change to your username';
        $password = 'change to your password';

        $result = SendReceiveCommands::getUserProjects($username, $password);
//        var_dump($result);
        var_dump($result->projects);

        $this->assertTrue($result->isKnownUser);
        $this->assertTrue($result->hasValidCredentials);
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
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $srProject = JsonEncoder::encode($sendReceiveProject);
        $srProject['identifier'] = 'sr_id';

        $newProjectId = SendReceiveCommands::updateSRProject($projectId, $srProject);

        $newProject = new LexProjectModel($newProjectId);
        $this->assertEquals($projectId, $newProjectId);
        $this->assertEquals($sendReceiveProject, $newProject->sendReceiveProject);
        $this->assertEquals($srProject['identifier'], $newProject->sendReceiveProjectIdentifier);
    }

    public function testGetUserProjects_BlankCredentials_CredentialsInvalid()
    {
        $username = '';
        $password = '';

        $result = SendReceiveCommands::getUserProjects($username, $password);

        $this->assertEquals(false, $result['hasValidCredentials']);
        $this->assertCount(0, $result['projects']);
    }

    public function testGetUserProjects_KnownUserInvalidPass_UserNotValidCredeentials()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $response = new Response(403);

        $result = SendReceiveCommands::getUserProjects($username, $password, [$response]);

        $this->assertEquals(false, $result['hasValidCredentials']);
        $this->assertCount(0, $result['projects']);
    }

    public function testGetUserProjects_UnknownUser_UserUnknown()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $response = new Response(404);

        $result = SendReceiveCommands::getUserProjects($username, $password, [$response]);

        $this->assertEquals(false, $result['hasValidCredentials']);
        $this->assertCount(0, $result['projects']);
    }

    public function testGetUserProjects_ValidCredentials_CredentialsValid()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $body = '[{"identifier": "identifier1", "name": "name", "repository": "", "role": ""}]';
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);

        $result = SendReceiveCommands::getUserProjects($username, $password, [$response]);

        $this->assertTrue($result['hasValidCredentials']);
        $this->assertCount(1, $result['projects']);
    }

    public function testGetUserProjects_2Projects_SortedByName()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $body = '[{"identifier": "identifier2", "name": "name2", "repository": "", "role": ""}, '.
            '{"identifier": "identifier1", "name": "name1", "repository": "", "role": ""}]';
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);

        $result = SendReceiveCommands::getUserProjects($username, $password, [$response]);

        $this->assertTrue($result['hasValidCredentials']);
        $this->assertCount(2, $result['projects']);
        $this->assertEquals('name1', $result['projects'][0]['name']);
        $this->assertEquals('name2', $result['projects'][1]['name']);
        $this->assertEquals('identifier1', $result['projects'][0]['identifier']);
    }

    public function testGetUserProjects_2ProjectsDuplicateIdentifiersBeginCase_RepoClarification()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $body = '[{"identifier": "identifier", "name": "name2", '.
            '"repository": "https://public.languagedepot.org", "role": ""}, '.
            '{"identifier": "identifier", "name": "name1", "repository": '.
            '"https://private.languagedepot.org", "role": ""}]';
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);

        $result = SendReceiveCommands::getUserProjects($username, $password, [$response]);

        $this->assertTrue($result['hasValidCredentials']);
        $this->assertCount(2, $result['projects']);
        $this->assertEquals('name1', $result['projects'][0]['name']);
        $this->assertEquals('private', $result['projects'][0]['repoClarification']);
        $this->assertEquals('name2', $result['projects'][1]['name']);
        $this->assertEquals('', $result['projects'][1]['repoClarification']);
    }

    public function testGetUserProjects_2ProjectsDuplicateIdentifiersEndCase_RepoClarification()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $body = '[{"identifier": "identifier", "name": "name2", "repository": '.
            '"https://private.languagedepot.org", "role": ""}, '.
            '{"identifier": "identifier", "name": "name1", '.
            '"repository": "https://public.languagedepot.org", "role": ""}]';
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);

        $result = SendReceiveCommands::getUserProjects($username, $password, [$response]);

        $this->assertTrue($result['hasValidCredentials']);
        $this->assertCount(2, $result['projects']);
        $this->assertEquals('name1', $result['projects'][0]['name']);
        $this->assertEquals('', $result['projects'][0]['repoClarification']);
        $this->assertEquals('name2', $result['projects'][1]['name']);
        $this->assertEquals('private', $result['projects'][1]['repoClarification']);
    }

    public function testGetUserProjects_TwoSRProjectsOneExistingLFProject_ProjectExists()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $body = '[{"identifier": "identifier", "name": "name2", "repository": "", "role": ""}, '.
            '{"identifier": "sr_id", "name": "sr_name", "repository": "", "role": ""}]';
        $response = new Response(200, ['Content-Type' => 'application/json'], $body);

        $result = SendReceiveCommands::getUserProjects($username, $password, [$response]);

        $this->assertTrue($result['hasValidCredentials']);
        $this->assertCount(2, $result['projects']);
        $this->assertEquals(false, $result['projects'][0]['isLinked']);
        $this->assertTrue($result['projects'][1]['isLinked']);
        $this->assertEquals('sr_name', $result['projects'][1]['name']);
    }

    public function testQueueProjectForEdit_NoSendReceive_NoAction()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $mockEditQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';
        FileUtilities::createAllFolders($mockEditQueuePath);

        $filename = SendReceiveCommands::queueProjectForEdit($projectId, $mockEditQueuePath);

        $queueFileNames = scandir($mockEditQueuePath);
        $this->assertEquals(false, $filename);
        $this->assertCount(2, $queueFileNames);
    }

    public function testQueueProjectForEdit_HasSendReceive_QueueFileCreated()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockEditQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';

        $filename = SendReceiveCommands::queueProjectForEdit($projectId, $mockEditQueuePath);

        $queueFileNames = scandir($mockEditQueuePath);
        $this->assertRegExp('/' . $project->projectCode . '/', $filename);
        $this->assertCount(3, $queueFileNames);
        FileUtilities::removeFolderAndAllContents($mockEditQueuePath);
    }

    public function testIsProcessRunningByPidFile_NoPidFile_NotRunning()
    {
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';

        $isRunning = SendReceiveCommands::isProcessRunningByPidFile($mockPidFilePath);

        $this->assertFalse($isRunning);
    }

    public function testStartLFMergeIfRequired_NoSendReceive_NoAction()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId);

        $this->assertFalse($isRunning);
    }

    private function WaitForFileExistAndNotEmpty($file, $timeoutSeconds)
    {
        $tenMicroSeconds = 10;
        $timeoutMicroSeconds = $timeoutSeconds * 1000000;
        for ($waitMicroSeconds = 0;
             $waitMicroSeconds < $timeoutMicroSeconds;
             $waitMicroSeconds += $tenMicroSeconds) {
            if (file_exists($file) && filesize($file) > 0) {
                break;
            }
            usleep($tenMicroSeconds);

            // See https://www.php.net/manual/en/function.clearstatcache.php
            // clearstatcache is necessary when checking file stat changes within a single script run
            clearstatcache();
        }
        return file_exists($file) && filesize($file) > 0;
    }

    public function testStartLFMergeIfRequired_HasSendReceiveButNoPidFile_Started()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $runSeconds = 10;
        $timeoutSeconds = 30;
        $mockCommand = 'php ' . __DIR__ . '/mockLFMergeExe.php ' . $runSeconds;

        $isRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $mockPidFilePath, $mockCommand);

        $this->assertTrue($isRunning);

        if (!$this->WaitForFileExistAndNotEmpty($mockPidFilePath, $timeoutSeconds)) {
            $this->fail('Waiting for PID file creation timed out - machine too busy?');
        }

        $this->assertTrue(SendReceiveCommands::isProcessRunningByPidFile($mockPidFilePath));
        $pidOne = file_get_contents($mockPidFilePath);

        $isStillRunning = SendReceiveCommands::startLFMergeIfRequired($projectId, $mockPidFilePath, $mockCommand);

        $this->assertTrue($isStillRunning);
        $this->assertEquals($pidOne, file_get_contents($mockPidFilePath));
    }

    public function testGetProjectStatus_NoSendReceive_NoState()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $status = SendReceiveCommands::getProjectStatus($projectId);

        $this->assertFalse($status);
    }

    public function testGetProjectStatus_HasSendReceiveNoStateFile_StateUnsynced()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);
        $this->assertEquals('LF_UNSYNCED', $status['SRState']);
        // TODO: The assert above is intermittently failing with "Undefined index: SRState", but not every time. Figure out why; I suspect a race condition of some kind. - RM 2018-03
    }

    public function testGetProjectStatus_HasSendReceiveAndStateFileNotJson_NoException()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . '/' . $project->projectCode . '.state';
        file_put_contents($projectStatePath, 'intentionally: not_valid_json, SRState: IDLE');

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertFalse($status);

        unlink($projectStatePath);
    }

    public function testGetProjectStatus_HasSendReceiveAndIdleStateFile_UnsyncedAndIdleState()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $projectId = $project->write();
        $mockStatePath = sys_get_temp_dir();
        $projectStatePath = $mockStatePath . DIRECTORY_SEPARATOR . strtolower($project->projectCode) . '.state';
        file_put_contents($projectStatePath, '{"SRState": "IDLE"}');

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertEquals('LF_UNSYNCED', $status['SRState']);

        $project->lastSyncedDate = UniversalTimestamp::now();
        $project->write();

        $status = SendReceiveCommands::getProjectStatus($projectId, $mockStatePath);

        $this->assertEquals('IDLE', $status['SRState']);

        unlink($projectStatePath);
    }

    public function testGetProjectStatus_HasSendReceiveAndInQueue_PendingState()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEquals('PENDING', $status['SRState']);
        FileUtilities::removeFolderAndAllContents($mockQueuePath);

        $mockQueuePath = $lfMergePaths->editQueuePath;
        SendReceiveCommands::queueProjectForEdit($projectId, $mockQueuePath);
        file_put_contents($projectStatePath, '{"SRState": "IDLE"}');
        $status = SendReceiveCommands::getProjectStatus($projectId, $lfMergePaths->statePath);
        $this->assertEquals('PENDING', $status['SRState']);
        FileUtilities::removeFolderAndAllContents($mockQueuePath);

        FileUtilities::removeFolderAndAllContents($tmpTestPath);
    }

    public function testGetProjectStatus_HasSendReceiveAndSyncing_SyncingState()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEquals('SYNCING', $status['SRState']);
        FileUtilities::removeFolderAndAllContents($mockQueuePath);

        $mockQueuePath = $lfMergePaths->editQueuePath;
        SendReceiveCommands::queueProjectForEdit($projectId, $mockQueuePath);
        file_put_contents($projectStatePath, '{"SRState": "SYNCING"}');
        $status = SendReceiveCommands::getProjectStatus($projectId, $lfMergePaths->statePath);
        $this->assertEquals('SYNCING', $status['SRState']);
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
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $isNotified = SendReceiveCommands::notificationReceiveRequest($project->projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationReceiveRequest_HasSendReceive_QueueFileCreated()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $project->write();
        $mockReceiveQueuePath = sys_get_temp_dir() . '/mockReceiveQueue';
        $mockPidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $mockCommand = 'php ' . __DIR__ . '/mockLFMergeExe.php';

        $isNotified = SendReceiveCommands::notificationReceiveRequest($project->projectCode, $mockReceiveQueuePath, $mockPidFilePath, $mockCommand);

        $queueFileNames = scandir($mockReceiveQueuePath);
        $this->assertTrue($isNotified);
        $this->assertCount(3, $queueFileNames);
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
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationSendRequest_HasSendReceive_NoAction()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $project->write();

        $isNotified = SendReceiveCommands::notificationSendRequest($project->projectCode);

        $this->assertFalse($isNotified);
    }

    public function testNotificationSendRequest_HasSendReceiveAndNoUncommittedEntries_NoAction()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertCount(3, $queueFileNames);
        FileUtilities::removeFolderAndAllContents($tmpTestPath);
    }
}
