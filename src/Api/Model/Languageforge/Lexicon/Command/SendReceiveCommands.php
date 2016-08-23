<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Command\ProjectCommands;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModelWithIdentifier;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\JsonEncoder;
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
    const RECEIVE_QUEUE_PATH = '/var/lib/languageforge/lexicon/sendreceive/receivequeue';
    const SEND_QUEUE_PATH = '/var/lib/languageforge/lexicon/sendreceive/sendqueue';
    const EDIT_QUEUE_PATH = '/var/lib/languageforge/lexicon/sendreceive/editqueue';
    const SYNC_QUEUE_PATH = '/var/lib/languageforge/lexicon/sendreceive/syncqueue';
    const WORK_PATH = '/var/lib/languageforge/lexicon/sendreceive/webwork';
    const STATE_PATH = '/var/lib/languageforge/lexicon/sendreceive/state';
    const LFMERGE_CONF_FILE_PATH = '/etc/languageforge/conf/sendreceive.conf';
    const LFMERGE_EXE = 'lfmerge';

    // duplicate of data in /test/app/testConstants.json
    const TEST_MEMBER_USERNAME = 'test_runner_normal_user';
    const TEST_SR_USERNAME = 'sr-mock-username';
    const TEST_SR_PASSWORD = 'sr-mock-password';

    private static $lfmergePidFilePaths = ['/tmp/run/lfmerge.pid', '/var/run/lfmerge.pid'];

    /**
     * @param string $projectId
     * @param string $srProject
     * @return string $projectId
     */
    public static function updateSRProject($projectId, $srProject)
    {
        if (!$srProject) return false;

        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        $project->sendReceiveProjectIdentifier = $srProject['identifier'];
        $project->sendReceiveProject = new SendReceiveProjectModel(
            $srProject['name'],
            $srProject['repository'],
            $srProject['role']
        );
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
        if (!$username) return JsonEncoder::encode($result);

        if (is_null($client)) $client = new Client();

        self::mockE2ETestingData($username, $password, $client);

        $url = 'http://admin.languagedepot.org/api/user/'.$username.'/projects';
        $postData = ['json' => ['password' => $password]];

        $tryCounter = 1;
        while ($tryCounter <= 5) {
            try {
                $result->errorMessage = '';
                $response = $client->post($url, $postData);
                break;
            } catch (RequestException $e) {
                $response = $e->getResponse();
                if ($e->getCode() != 403 && $e->getCode() != 404) {
                    $tryCounter++;
                    $result->errorMessage = $e->getMessage();
                    continue;
                }
                break;
            }
        }

        /** @noinspection PhpUndefinedVariableInspection */
        if ($response->getStatusCode() == 403) $result->isKnownUser = true;

        if ($response->getStatusCode() == 200) {
            $result->isKnownUser = true;
            $result->hasValidCredentials = true;
            foreach ($response->json() as $index => $srProject) {
                $result->projects[] = new SendReceiveProjectModelWithIdentifier(
                    $srProject['identifier'],
                    $srProject['name'],
                    $srProject['repository'],
                    $srProject['role']
                );
            }
        }

        $data = JsonEncoder::encode($result);
        self::addSRProjectClarification($data['projects']);
        self::sortSRProjectByName($data['projects']);
        self::checkSRProjectsAreLinked($data['projects']);

        return $data;
    }

    /**
     * @param string $projectId
     * @param string $syncQueuePath
     * @return string|bool $filename on success or false otherwise
     */
    public static function queueProjectForSync($projectId, $syncQueuePath = null)
    {
        $project = new LexProjectModel($projectId);
        if (!$project->hasSendReceive()) return false;

        if (is_null($syncQueuePath)) $syncQueuePath = self::getLFMergePaths()->syncQueuePath;

        FileUtilities::createAllFolders($syncQueuePath);
        // $milliseconds = round(microtime(true) * 1000);
        $filename =  $project->projectCode; // . '_' . $milliseconds;
        $filePath = $syncQueuePath . '/' . $filename;
        $line = 'projectCode: ' . $project->projectCode;
        if (!file_put_contents($filePath, $line)) return false;

        return $filename;
    }

    /**
     * @param string $projectId
     * @param string $editQueuePath
     * @return bool|string $filename on success or false otherwise
     */
    public static function queueProjectForEdit($projectId, $editQueuePath = null)
    {
        $project = new LexProjectModel($projectId);
        if (!$project->hasSendReceive()) return false;

        if (is_null($editQueuePath)) $editQueuePath = self::getLFMergePaths()->editQueuePath;

        FileUtilities::createAllFolders($editQueuePath);
        //$milliseconds = round(microtime(true) * 1000);
        $filename =  $project->projectCode; // . '_' . $milliseconds;
        $filePath = $editQueuePath . '/' . $filename;
        $line = 'projectCode: ' . $project->projectCode;
        if (!file_put_contents($filePath, $line)) return false;

        return $filename;
    }

    /**
     * @param string $projectId
     * @param string $pidFilePath
     * @param string $command
     * @return bool true if process started or already running, otherwise false
     * @throws \Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException
     * @throws \Exception
     */
    public static function startLFMergeIfRequired($projectId, $pidFilePath = null, $command = null)
    {
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if (!$project->hasSendReceive()) return false;

        if (is_null($pidFilePath)) {
            $pidFilePath = self::$lfmergePidFilePaths[0];
            foreach (self::$lfmergePidFilePaths as $path) {
                if (file_exists($path)) {
                    $pidFilePath = $path;
                    break;
                }
            }
        }

        if (self::isProcessRunningByPidFile($pidFilePath)) return true;

        if (is_null($command)) $command = self::LFMERGE_EXE . ' -p ' . $project->projectCode;

        if (!self::commandExists($command)) throw new \Exception('LFMerge is not installed. Contact the website administrator.');

        $pid = self::runInBackground($command);

        return self::isProcessRunningByPid($pid);
    }

    /**
     * Decode the state file for project status.  If the project is in a queue, override the state to PENDING
     * @param string $projectId
     * @param string $statePath
     * @return bool|array
     */
    public static function getProjectStatus($projectId, $statePath = null)
    {
        $project = new LexProjectModel($projectId);
        if (!$project->hasSendReceive()) return false;

        if (is_null($statePath)) {
            $statePath = self::getLFMergePaths()->statePath;
        }else {
            self::getLFMergePaths(true, realpath($statePath . '/..'));
        }

        $projectStatePath = $statePath . DIRECTORY_SEPARATOR . strtolower($project->projectCode) . '.state';
        if (!file_exists($projectStatePath) || !is_file($projectStatePath)) return false;

        $statusJson = file_get_contents($projectStatePath);
        $status = json_decode($statusJson, true);

        // If the project is in a queue and the state is IDLE, override the state to PENDING
        if (array_key_exists('SRState', $status) && $status['SRState'] == "IDLE" &&
            (file_exists(self::getLFMergePaths()->editQueuePath . DIRECTORY_SEPARATOR . $project->projectCode) ||
            file_exists(self::getLFMergePaths()->syncQueuePath . DIRECTORY_SEPARATOR . $project->projectCode))
        ) {
            $status['SRState'] = "PENDING";
        }

        // If the previousRunTotalMilliseconds is set, estimate percentComplete
        if (array_key_exists('PreviousRunTotalMilliseconds', $status) &&
            array_key_exists('StartTimestamp', $status)
        ) {
            $previousRunTotalMilliseconds = $status['PreviousRunTotalMilliseconds'];
            if ($previousRunTotalMilliseconds <= 0) {
                $previousRunTotalMilliseconds = 4*60*1000; // 4 minutes
            }
            $status['PercentComplete'] = min(99, intval((time() - $status['StartTimestamp']) / ($previousRunTotalMilliseconds / 1000) * 100));
        }
        return $status;
    }

    /**
     * @param string $projectCode
     * @param string $receiveQueuePath
     * @param string $pidFilePath
     * @param string $command
     * @return bool true if notification file is created (or already exists) and LFMerge started, false otherwise
     * @throws \Exception
     */
    public static function notificationReceiveRequest($projectCode, $receiveQueuePath = null, $pidFilePath = null, $command = null)
    {
        $project = new LexProjectModel();
        if (!$project->readByProperty('projectCode', $projectCode)) return false;
        if (!$project->hasSendReceive()) return false;

        if (is_null($receiveQueuePath)) $receiveQueuePath = self::getLFMergePaths()->receiveQueuePath;

        $notificationFilePath = $receiveQueuePath . '/' . $project->projectCode . '.notification';
        if (!file_exists($notificationFilePath) || !is_file($notificationFilePath)) {
            FileUtilities::createAllFolders($receiveQueuePath);
            if (file_put_contents($notificationFilePath, '') === false) throw new \Exception('Cannot write to Send/Receive Receive Queue. Contact the website administrator.');
        }

        return self::startLFMergeIfRequired($project->id->asString(), $pidFilePath, $command);
    }

    /**
     * @param string $projectCode
     * @param string $statePath
     * @param string $sendQueuePath
     * @param string $pidFilePath
     * @param string $command
     * @return bool true if notification file is created (or already exists) and LFMerge started, false otherwise
     * @throws \Exception
     */
    public static function notificationSendRequest($projectCode, $statePath = null, $sendQueuePath = null, $pidFilePath = null, $command = null)
    {
        $project = new LexProjectModel();
        if (!$project->readByProperty('projectCode', $projectCode)) return false;
        if (!$project->hasSendReceive()) return false;

        $status = self::getProjectStatus($project->id->asString(), $statePath);
        if (!$status || !array_key_exists('uncommittedEditCount', $status)) return false;
        if ($status['uncommittedEditCount'] <= 0) return false;

        if (is_null($sendQueuePath)) $sendQueuePath = self::getLFMergePaths()->sendQueuePath;

        $notificationFilePath = $sendQueuePath . '/' . $project->projectCode . '.notification';
        if (!file_exists($notificationFilePath) || !is_file($notificationFilePath)) {
            FileUtilities::createAllFolders($sendQueuePath);
            if (file_put_contents($notificationFilePath, '') === false) throw new \Exception('Cannot write to Send/Receive Send Queue. Contact the website administrator.');
        }

        return self::startLFMergeIfRequired($project->id->asString(), $pidFilePath, $command);
    }

    /**
     * @param bool $reload will reload the configuration if true
     * @param string $basePath If specified, base path for the directories
     * @return SendReceivePaths|null
     */
    public static function getLFMergePaths($reload = false, $basePath = null)
    {
        static $paths = null;

        if (is_null($paths) || $reload) {
            $paths = new SendReceivePaths();
            $paths->mergeQueuePath = self::MERGE_QUEUE_PATH;
            $paths->receiveQueuePath = self::RECEIVE_QUEUE_PATH;
            $paths->sendQueuePath = self::SEND_QUEUE_PATH;
            $paths->editQueuePath = self::EDIT_QUEUE_PATH;
            $paths->syncQueuePath = self::SYNC_QUEUE_PATH;
            $paths->workPath = self::WORK_PATH;
            $paths->statePath = self::STATE_PATH;

            if (is_null($basePath)) {
                if (!file_exists(self::LFMERGE_CONF_FILE_PATH)) return $paths;

                $conf = parse_ini_string(self::removeConfComments(self::LFMERGE_CONF_FILE_PATH));
                if (!array_key_exists('BaseDir', $conf)) return $paths;

                $basePath = $conf['BaseDir'];
            }

            foreach ($paths as &$path) {
                $path = $basePath . DIRECTORY_SEPARATOR . basename($path);
            }
        }

        return $paths;
    }

    /**
     * @param $identifier
     * @return string|bool $projectId if send receive project is linked to a LF project, false otherwise
     */
    public static function getProjectIdFromSendReceive($identifier)
    {
        $project = new LexProjectModel();
        if (!$project->readByProperty('sendReceiveProjectIdentifier', $identifier)) return false;

        return $project->id->asString();
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
        return posix_kill(intval($pid), 0);
    }

    /**
     * @param string $command
     * @return bool
     */
    private static function commandExists($command)
    {
        return !!`which $command`;
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
//            $pid = shell_exec("nohup $command > /tmp/LfMergeOut.log 2> /tmp/LfMergeErr.log & echo $!");
        }
        return $pid;
    }

    /**
     * Remove conf file comments because '#" comments are deprecated in PHP but typically used in Linux conf files
     * @param string $filePath
     * @return string
     */
    private static function removeConfComments($filePath)
    {
        $confStr = "";
        $lines = explode("\n", file_get_contents($filePath));
        foreach($lines as $line) {
            if(!$line || $line[0] == "#" || $line[0] == ";") continue;

            $confStr .= $line . "\n";
        }
        return $confStr;
    }

    /**
     * @param string $username
     * @param string $password
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
                $body = Stream::factory('[{"identifier": "mock-id1", "name": "mock-name1", "repository":'.
                    ' "http://public.languagedepot.org", "role": "manager", "isLinked": false}, '.
                    '{"identifier": "mock-id2", "name": "mock-name2", "repository": '.
                    '"http://public.languagedepot.org", "role": "contributor", "isLinked": false}, '.
                    '{"identifier": "mock-id3", "name": "mock-name3", "repository": '.
                    '"http://public.languagedepot.org", "role": "contributor", "isLinked": false}, '.
                    '{"identifier": "mock-id4", "name": "mock-name4", "repository": '.
                    '"http://private.languagedepot.org", "role": "manager", "isLinked": false}]');
                $response = new Response(200, ['Content-Type' => 'application/json'], $body);
                $mock = new Mock([$response]);
                $client->getEmitter()->attach($mock);
            } else {
                $mock = new Mock([new Response(403)]);
                $client->getEmitter()->attach($mock);
            }
        }
    }

    /**
     * @param array $projects
     * @return array
     */
    private static function addSRProjectClarification(&$projects)
    {
        // sort projects by identifier then repository
        usort($projects, function ($a, $b) {
            $sortOn = 'identifier';
            if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
                if ($a[$sortOn] == $b[$sortOn]) {
                    $sortOn = 'repository';
                    if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
                        return strcmp($a[$sortOn], $b[$sortOn]);
                    } else {
                        return 0;
                    }
                }

                return strcmp($a[$sortOn], $b[$sortOn]);
            } else {
                return 0;
            }
        });

        if (array_key_exists(1, $projects) &&
            $projects[1]['identifier'] == $projects[0]['identifier'] &&
            stripos($projects[0]['repository'], '://private') !== false) {
            $projects[0]['repoClarification'] = 'private';
        }
        foreach ($projects as $index => &$project) {
            if (!array_key_exists('repoClarification', $project)) {
                $project['repoClarification'] = '';
            }
            if (array_key_exists($index - 1, $projects) &&
                $projects[$index - 1]['identifier'] == $project['identifier'] &&
                stripos($project['repository'], '://private') !== false) {
                $project['repoClarification'] = 'private';
            }
        }

        return $projects;
    }

    /**
     * @param array $projects
     * @return array
     */
    private static function sortSRProjectByName(&$projects)
    {
        usort($projects, function ($a, $b) {
            $sortOn = 'name';
            if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
                return strcmp($a[$sortOn], $b[$sortOn]);
            } else {
                return 0;
            }
        });

        return $projects;
    }

    /**
     * @param array $projects
     * @return array
     */
    private static function checkSRProjectsAreLinked(&$projects)
    {
        foreach ($projects as $index => &$project) {
            $project['isLinked'] = self::isSendReceiveProjectLinked($project['identifier']);
        }

        return $projects;
    }

    /**
     * @param $identifier
     * @return bool true if send receive project is linked to a LF project
     */
    private static function isSendReceiveProjectLinked($identifier)
    {
        $projectId = self::getProjectIdFromSendReceive($identifier);
        return ($projectId !== false);
    }

}

class SendReceivePaths
{
    /**
     * @var string
     */
    public $mergeQueuePath;

    /**
     * @var string
     */
    public $receiveQueuePath;

    /**
     * @var string
     */
    public $sendQueuePath;

    /**
     * @var string
     */
    public $editQueuePath;

    /**
     * @var string
     */
    public $syncQueuePath;

    /**
     * @var string
     */
    public $workPath;

    /**
     * @var string
     */
    public $statePath;
}

class SendReceiveGetUserProjectResult
{
    public function __construct()
    {
        $this->isKnownUser = false;
        $this->errorMessage = '';
        $this->hasValidCredentials = false;
        $this->projects = new ArrayOf(function() {
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
     * @var ArrayOf <SendReceiveProjectModel>
     */
    public $projects;

    /**
     * @var string
     */
    public $errorMessage;
}
