<?php

use Api\Library\Languageforge\Lexicon\LanguageServerApiInterface;
use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexiconProjectModelWithSRPassword;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;
use GuzzleHttp\Client;
use GuzzleHttp\Message\Response;
use GuzzleHttp\Stream\Stream;
use GuzzleHttp\Subscriber\Mock;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class MockLanguageServerApi implements LanguageServerApiInterface
{
    public function __construct($identifier = '') {
        $this->identifier = $identifier;
    }

    public $identifier;

    public function getWebMetaData($url, $queryData, $method = 'POST')
    {
        $metaData = array();
        $metaData['wrapper_data'] = array();
        $metaData['wrapper_data'][0] = 'HTTP/1.1 302 Found ';

        return $metaData;
    }

    public function getWebContent($url, $method = 'GET', $queryData = array())
    {
        $response = array(
            array(
                'identifier' => $this->identifier
            )
        );
        return json_encode($response);
    }
}

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
/*
    public function testCheckProjectActualApi_ExistingProject_ProjectExists()
    {
        $identifier = 'test-eb-sena3-flex';
        $username = 'change to your username';
        $password = 'change to your password';

        $result = SendReceiveCommands::checkProject($identifier, $username, $password);

        $this->assertEqual($result->hasValidCredentials, true);
        $this->assertEqual($result->projectExists, true);
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

        $identifier = 'sr_id';
        $username = 'sr_user';
        $password = 'sr_pass';

        $newProjectId = SendReceiveCommands::saveCredentials($projectId, $identifier, $username, $password);

        $newProject = new LexiconProjectModelWithSRPassword($newProjectId);
        $this->assertEqual($newProjectId, $projectId);
        $this->assertEqual($newProject->sendReceiveIdentifier, $identifier);
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

    public function testGetUserProjects_KnownUserBlankPassword_UserUnknown()
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

    public function testCheckProject_BlankProject_ProjectDoesntExist()
    {
        $identifier = '';
        $username = 'mock_user';
        $password = 'mock_pass';
        $api = new MockLanguageServerApi();

        $result = SendReceiveCommands::checkProject($identifier, $username, $password, $api);

        $this->assertEqual($result->hasValidCredentials, true);
        $this->assertEqual($result->projectExists, false);
        $this->assertEqual($result->hasAccessToProject, false);
    }

    public function testCheckProject_ExistingProject_ProjectExists()
    {
        $identifier = 'mock_project_id';
        $username = 'mock_user';
        $password = 'mock_pass';
        $api = new MockLanguageServerApi($identifier);

        $result = SendReceiveCommands::checkProject($identifier, $username, $password, $api);

        $this->assertEqual($result->hasValidCredentials, true);
        $this->assertEqual($result->projectExists, true);
        $this->assertEqual($result->hasAccessToProject, true);
    }
}
