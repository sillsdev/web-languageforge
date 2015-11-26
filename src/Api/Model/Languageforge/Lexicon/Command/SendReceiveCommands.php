<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Library\Languageforge\Lexicon\LanguageServerApiInterface;
use Api\Model\Languageforge\Lexicon\LexiconProjectModelWithSRPassword;
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
     * @param string $identifier
     * @param string $username
     * @param string $password
     * @return string
     */
    public static function saveCredentials($projectId, $identifier, $username, $password)
    {
        if (!$identifier || !$username || !$password) {
            return false;
        }

        $project = new LexiconProjectModelWithSRPassword($projectId);
        $project->sendReceiveIdentifier = $identifier;
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
                $body = Stream::factory('[{"identifier": "mock-id1", "name": "mock-name1", "repository": "", "role": "manager"},{"identifier": "mock-id2", "name": "mock-name2", "repository": "", "role": "contributor"}]');
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
            foreach ($response->json() as $index => $project) {
                $result->projects[strval($index)] = new sendReceiveProjectOptions(
                    $project['identifier'],
                    $project['name'],
                    $project['repository'],
                    $project['role']
                );
            }
        }

        return $result;
    }

    /**
     * Based on http://php.net/manual/en/context.http.php
     * @param $username
     * @param $password
     * @param LanguageServerApiInterface $api
     * @return SendReceiveResult
     */
    public static function checkCredentials($username, $password, LanguageServerApiInterface $api = null)
    {
        $result = new SendReceiveResult();
        if (!$username || !$password) {
            return $result;
        }

        $serverUrl = 'http://public.languagedepot.org/';
        $url = $serverUrl . 'login';
        $postData = array(
            'back_url' => $serverUrl,
            'username' => $username,
            'password' => $password,
            'login' => 'Login »'
        );

        $metaData = self::getWebMetaData($url, $postData, 'POST', $api);

        if (strpos($metaData['wrapper_data'][0], '302 Found') !== false) {
            $result->hasValidCredentials = true;
        } else {
            $serverUrl = 'http://private.languagedepot.org/';
            $url = $serverUrl . 'login';
            $postData = array(
                'back_url' => $serverUrl,
                'username' => $username,
                'password' => $password,
                'login' => 'Login »'
            );

            $metaData = self::getWebMetaData($url, $postData, 'POST', $api);

            if (strpos($metaData['wrapper_data'][0], '302 Found') !== false) {
                $result->hasValidCredentials = true;
            }
        }

        return $result;
    }

    /**
     * @param string $identifier
     * @param string $username
     * @param string $password
     * @param LanguageServerApiInterface $api
     * @return SendReceiveResult
     */
    public static function checkProject($identifier, $username, $password, LanguageServerApiInterface $api = null)
    {
        $result = self::checkCredentials($username, $password, $api);

        $url = 'http://admin.languagedepot.org/api/project';
        $data = self::getWebContent($url, 'GET', array(), $api);
        $response = json_decode($data);

        if (self::isPropertyValueInObjectArray($response, 'identifier', $identifier)) {
            $result->projectExists = true;
        } else {
            $url .= '/private';
            $data = self::getWebContent($url, 'GET', array(), $api);
            $response = json_decode($data);

            if (self::isPropertyValueInObjectArray($response, 'identifier', $identifier)) {
                $result->projectExists = true;
            }
        }

        // ToDo: connect to new Language Depot API, currently assumes access
        $result->hasAccessToProject = $result->projectExists && $result->hasValidCredentials;

        return $result;
    }

    /**
     * @param string $url
     * @param string $queryData
     * @param string $method
     * @param LanguageServerApiInterface $api
     * @return array
     */
    private static function getWebMetaData($url, $queryData, $method = 'POST', LanguageServerApiInterface $api = null)
    {
        // Create our default api if one is not passed in.
        if ($api == null) {
            $api = new LanguageServerApi();
        }

        return $api->getWebMetaData($url, $queryData, $method);
    }

    /**
     * @param $url
     * @param $method
     * @param $queryData
     * @param LanguageServerApiInterface $api
     * @return mixed
     */
    protected static function getWebContent($url, $method = 'GET', $queryData = array(), LanguageServerApiInterface $api = null)
    {
        // Create our default api if one is not passed in.
        if ($api == null) {
            $api = new LanguageServerApi();
        }

        return $api->getWebContent($url, $method, $queryData);
    }

    /**
     * @param array $array
     * @param string $property
     * @param mixed $value
     * @return bool
     */
    private static function isPropertyValueInObjectArray($array, $property, $value)
    {
        if (!$value or !$array) {
            return false;
        }

        foreach ($array as $object) {
            if (property_exists($object, $property) and $object->{$property} == $value) {
                return true;
            }
        }

        return false;
    }
}

class SendReceiveGetUserProjectResult
{
    public function __construct()
    {
        $this->isKnownUser = false;
        $this->hasValidCredentials = false;
        $this->projects = new MapOf(function() {
            return new SendReceiveProjectOptions();
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
     * @var MapOf <SendReceiveProjectOptions>
     */
    public $projects;
}

class SendReceiveProjectOptions
{
    public function __construct($identifier = '', $name = '', $repository = '', $role = '')
    {
        $this->identifier = $identifier;
        $this->name = $name;
        $this->repository = $repository;
        $this->role = $role;
    }

    /**
     * @var string Language Depot project identifier
     */
    public $identifier;

    /**
     * @var string Language Depot project name
     */
    public $name;

    /**
     * @var string Language Depot project repository
     */
    public $repository;

    /**
     * @var string Language Depot project role
     */
    public $role;
}

class SendReceiveResult
{
    public function __construct()
    {
        $this->hasValidCredentials = false;
        $this->projectExists = false;
        $this->hasAccessToProject = false;
    }

    /**
     * @var bool true if the username and password are valid, false otherwise
     */
    public $hasValidCredentials;

    /**
     * @var bool true if the project exists, false otherwise
     */
    public $projectExists;

    /**
     * @var bool true if the user credentials can access the specified project, false otherwise
     */
    public $hasAccessToProject;
}

class LanguageServerApi implements LanguageServerApiInterface
{
    /**
     * @param string $url
     * @param string $queryData
     * @param string $method
     * @return array
     */
    public function getWebMetaData($url, $queryData, $method = 'POST')
    {
        $options = array(
            'http' => array(
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => $method,
                'content' => http_build_query($queryData)
            )
        );
        $context = stream_context_create($options);
        $stream = fopen($url, 'r', null, $context);
        $metaData = stream_get_meta_data($stream);
        fclose($stream);

        return $metaData;
    }

    /**
     * @param $url
     * @param $method
     * @param $queryData
     * @return mixed
     */
    public function getWebContent($url, $method = 'GET', $queryData = array())
    {
        $options = array(
            'http' => array(
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => $method,
                'content' => http_build_query($queryData)
            )
        );
        $context = stream_context_create($options);
        $data = file_get_contents($url, null, $context);

        return $data;
    }
}
