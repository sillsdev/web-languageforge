<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Languageforge\Lexicon\LexiconProjectModelWithSRPassword;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Mapper\MapOf;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Message\Response;
use GuzzleHttp\Stream\Stream;
use GuzzleHttp\Subscriber\Mock;
use Palaso\Utilities\FileUtilities;

class SendReceiveCommands
{
    const MERGE_QUEUE_PATH = '/var/lib/languageforge/lexicon/sendreceive/mergequeue';
    const LFMERGE_PID_FILE_PATH = '/var/run/lfmerge.pid';
    const LFMERGE_EXE = 'LFMerge.exe';

    // duplicate of data in /test/app/testConstants.json
    const TEST_MEMBER_USERNAME = 'test_runner_normal_user';
    const TEST_SR_USERNAME = 'sr-mock-username';
    const TEST_SR_PASSWORD = 'sr-mock-password';

    /**
     * @param string $projectId
     * @param string $srProject
     * @param string $username
     * @param string $password
     * @return string $projectId
     */
    public static function saveCredentials($projectId, $srProject, $username, $password)
    {
        if (!$srProject || !$username || !$password) {
            return false;
        }

        $project = new LexiconProjectModelWithSRPassword($projectId);
        $project->sendReceiveProject = new SendReceiveProjectModel(
            $srProject['identifier'],
            $srProject['name'],
            $srProject['repository'],
            $srProject['role']
        );
        $project->sendReceiveUsername = $username;
        $project->sendReceivePassword = $password;
        return $project->write();
    }

    /**
     * @param string $username
     * @param string $password
     * @param ClientInterface|null $client
     * @return SendReceiveGetUserProjectResult
     */
    public static function getUserProjects($username, $password, ClientInterface $client = null)
    {
        $result = new SendReceiveGetUserProjectResult();
        if (!$username) return $result;

        if (is_null($client)) $client = new Client();

        self::mockE2ETestingData($username, $password, $client);

        $url = 'http://admin.languagedepot.org/api/user/'.$username.'/projects';
        $postData = ['json' => ['password' => $password]];

        try {
            $response = $client->post($url, $postData);
        } catch (RequestException $e) {
            if ($e->getCode() != 403 && $e->getCode() != 404)  throw $e;

            $response = $e->getResponse();
        }

        if ($response->getStatusCode() == 403) $result->isKnownUser = true;

        if ($response->getStatusCode() == 200) {
            $result->isKnownUser = true;
            $result->hasValidCredentials = true;
            foreach ($response->json() as $index => $srProject) {
                $result->projects[strval($index)] = new SendReceiveProjectModel(
                    $srProject['identifier'],
                    $srProject['name'],
                    $srProject['repository'],
                    $srProject['role']
                );
            }
        }

        return $result;
    }

    /**
     * @param LexiconProjectModel $project
     * @param string $mergeQueuePath
     * @return string|bool $filename on success or false otherwise
     */
    public static function queueProjectForUpdate($project, $mergeQueuePath = null)
    {
        if (!$project->hasSendReceive()) return false;

        if (is_null($mergeQueuePath)) $mergeQueuePath = self::MERGE_QUEUE_PATH;

        FileUtilities::createAllFolders($mergeQueuePath);
        $milliseconds = round(microtime(true) * 1000);
        $filename =  $project->projectCode . '_' . $milliseconds;
        $filePath = $mergeQueuePath . '/' . $filename;
        $line = 'projectCode: ' . $project->projectCode;
        if (!file_put_contents($filePath, $line)) return false;

        return $filename;
    }

    /**
     * @param string $projectId
     * @param string $queueType
     * @param string $pidFilePath
     * @param string $command
     * @return bool true if process started or already running, otherwise false
     * @throws \Exception
     */
    public static function startLFMergeIfRequired($projectId, $queueType = 'merge', $pidFilePath = null, $command = null)
    {
        $project = new LexiconProjectModel($projectId);
        if (!$project->hasSendReceive()) return false;

        if (is_null($pidFilePath)) $pidFilePath = self::LFMERGE_PID_FILE_PATH;

        if (self::isProcessRunningByPidFile($pidFilePath)) return true;

        if (is_null($command)) $command = self::LFMERGE_EXE . ' -q ' . $queueType . ' -p ' . $project->projectCode;

        if (!self::commandExists($command)) throw new \Exception('LFMerge is not installed. Contact the website administrator.');

        $pid = self::runInBackground($command);

        return self::isProcessRunningByPid(intval($pid));
    }

    public static function commandExists($command)
    {
        return !!`which $command`;
    }

    /**
     * Taken from http://stackoverflow.com/questions/3111406/checking-if-process-still-running
     * @param string $pidFilePath
     * @return bool
     */
    public static function isProcessRunningByPidFile($pidFilePath)
    {
        if (!file_exists($pidFilePath) || !is_file($pidFilePath)) return false;
        $pid = file_get_contents($pidFilePath);
        return self::isProcessRunningByPid($pid);
    }

    /**
     * Taken from http://stackoverflow.com/questions/3111406/checking-if-process-still-running
     * @param string $pid
     * @return bool
     */
    private static function isProcessRunningByPid($pid)
    {
        return posix_kill($pid, 0);
    }

    /**
     * Taken from https://nsaunders.wordpress.com/2007/01/12/running-a-background-process-in-php/
     * @param string $command
     * @param int $priority
     * @return string $pid
     */
    private static function runInBackground($command, $priority = 0)
    {
        if ($priority) {
            $pid = shell_exec("nohup nice -n $priority $command > /dev/null 2> /dev/null & echo $!");
        } else {
            $pid = shell_exec("nohup $command > /dev/null 2> /dev/null & echo $!");
        }
        return $pid;
    }

    /**
     * @param $username
     * @param $password
     * @param ClientInterface $client
     */
    private static function mockE2ETestingData($username, $password, ClientInterface $client)
    {
        if ($username == self::TEST_MEMBER_USERNAME) {
            $mock = new Mock([new Response(404)]);
            $client->getEmitter()->attach($mock);
        }

        if ($username == self::TEST_SR_USERNAME) {
            if ($password == self::TEST_SR_PASSWORD) {
                $body = Stream::factory('[{"identifier": "mock-id1", "name": "mock-name1", "repository": "http://public.languagedepot.org", "role": "manager"},{"identifier": "mock-id2", "name": "mock-name2", "repository": "http://public.languagedepot.org", "role": "contributor"}]');
                $response = new Response(200, ['Content-Type' => 'application/json'], $body);
                $mock = new Mock([$response]);
                $client->getEmitter()->attach($mock);
            } else {
                $mock = new Mock([new Response(403)]);
                $client->getEmitter()->attach($mock);
            }
        }
    }
}

class SendReceiveGetUserProjectResult
{
    public function __construct()
    {
        $this->isKnownUser = false;
        $this->hasValidCredentials = false;
        $this->projects = new MapOf(function() {
            return new SendReceiveProjectModel();
        });
    }

    /**
     * @var bool true if the username exists, false otherwise
     */
    public $isKnownUser;

    /**
     * @var bool true if the username and password are valid, false otherwise
     */
    public $hasValidCredentials;

    /**
     * @var MapOf <SendReceiveProjectModel>
     */
    public $projects;
}
