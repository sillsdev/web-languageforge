<?php

use Api\Library\Languageforge\Lexicon\LanguageServerApiInterface;
use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class MockLanguageServerApi implements LanguageServerApiInterface
{
    public function __construct($projectCode = '') {
        $this->projectCode = $projectCode;
    }

    public $projectCode;

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
                'identifier' => $this->projectCode
            )
        );
        return json_encode($response);
    }
}

class TestSendReceiveCommands extends UnitTestCase
{
/*
    public function testCheckCredentialsActualApi_ValidCredentials_CredentialsValid()
    {
        $username = 'change to your username';
        $password = 'change to your password';

        $result = SendReceiveCommands::checkCredentials($username, $password);

        $this->assertEqual($result->hasValidCredentials, true);
    }

    public function testCheckProjectActualApi_ExistingProject_ProjectExists()
    {
        $projectCode = 'test-eb-sena3-flex';
        $username = 'change to your username';
        $password = 'change to your password';

        $result = SendReceiveCommands::checkProject($projectCode, $username, $password);

        $this->assertEqual($result->hasValidCredentials, true);
        $this->assertEqual($result->projectExists, true);
    }
*/
    public function testCheckCredentials_BlankCredentials_CredentialsInvalid()
    {
        $username = '';
        $password = '';
        $api = new MockLanguageServerApi();

        $result = SendReceiveCommands::checkCredentials($username, $password, $api);

        $this->assertEqual($result->hasValidCredentials, false);
    }

    public function testCheckCredentials_ValidCredentials_CredentialsValid()
    {
        $username = 'mock_user';
        $password = 'mock_pass';
        $api = new MockLanguageServerApi();

        $result = SendReceiveCommands::checkCredentials($username, $password, $api);

        $this->assertEqual($result->hasValidCredentials, true);
    }

    public function testCheckProject_BlankProject_ProjectDoesntExist()
    {
        $projectCode = '';
        $username = 'mock_user';
        $password = 'mock_pass';
        $api = new MockLanguageServerApi();

        $result = SendReceiveCommands::checkProject($projectCode, $username, $password, $api);

        $this->assertEqual($result->hasValidCredentials, true);
        $this->assertEqual($result->projectExists, false);
    }

    public function testCheckProject_ExistingProject_ProjectExists()
    {
        $projectCode = 'mock_project_code';
        $username = 'mock_user';
        $password = 'mock_pass';
        $api = new MockLanguageServerApi($projectCode);

        $result = SendReceiveCommands::checkProject($projectCode, $username, $password, $api);

        $this->assertEqual($result->hasValidCredentials, true);
        $this->assertEqual($result->projectExists, true);
    }
}
