<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Languageforge\Lexicon\LexiconProjectModelWithSRPassword;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Mapper\MapOf;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Message\Response;
use GuzzleHttp\Stream\Stream;
use GuzzleHttp\Subscriber\Mock;

class SendReceiveCommands
{
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
        if (!$username) {
            return $result;
        }

        if (!$client) {
            $client = new Client();
        }

        // mock data for E2E testing
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

        $url = 'http://admin.languagedepot.org/api/user/'.$username.'/projects';
        $postData = ['json' => ['password' => $password]];

        try {
            $response = $client->post($url, $postData);
        } catch (RequestException $e) {
            if ($e->getCode() != 403 && $e->getCode() != 404) {
                throw $e;
            }

            $response = $e->getResponse();
        }

        if ($response->getStatusCode() == 403) {
            $result->isKnownUser = true;
        }

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
