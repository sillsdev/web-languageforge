<?php

use Api\Library\Shared\Website;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Shared\Command\SessionCommands;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\ProjectModel;
use PHPUnit\Framework\TestCase;

class SessionTestEnvironment
{
    /** @var ProjectModel */
    public $project;

    /** @var string */
    public $projectId;

    /** @var QuestionModel */
    public $question;

    /** @var string */
    public $questionId;

    /** @var string */
    public $userId;

    /** @var Website */
    public $website;

    public function create()
    {
        $environ = $this->getEnviron();
        $environ->clean();
        $this->website = $environ->website;

        $this->project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $this->question = new QuestionModel($this->project);
        $this->question->write();

        $this->userId = $environ->createUser('test_user', 'Test User', 'test_user@example.com');
        $this->projectId = $this->project->id->asString();
        $this->questionId = $this->question->id->asString();
    }

    /**
     * @return MongoTestEnvironment
     */
    protected function getEnviron(): MongoTestEnvironment
    {
        return new MongoTestEnvironment();
    }

}

class LfSessionTestEnvironment extends SessionTestEnvironment {
    protected function getEnviron(): MongoTestEnvironment
    {
        return new LexiconMongoTestEnvironment();
    }
}

class SessionCommandsTest extends TestCase
{

    /**
     * @throws Exception
     */
    public function testSessionData_userIsNotPartOfProjectInLf()
    {
        $environ = new LfSessionTestEnvironment();
        $environ->create();
        $data = SessionCommands::getSessionData($environ->projectId, $environ->userId, $environ->website);

        // Session data should contain a userId but not a projectId
        $this->assertArrayHasKey('userId', $data);
        $this->assertTrue(is_string($data['userId']));
        $this->assertEquals($environ->userId, $data['userId']);

        // Session data should also contain "site", a string...
        $this->assertArrayHasKey('baseSite', $data);
        $this->assertTrue(is_string($data['baseSite']));
        // ... and "fileSizeMax", an integer
        $this->assertArrayHasKey('fileSizeMax', $data);
        $this->assertTrue(is_integer($data['fileSizeMax']));

        // Session data should contain projectSettings, an array with only interFaceConfig
        $this->assertArrayHasKey('projectSettings', $data);
        $this->assertTrue(is_array($data['projectSettings']));
        $this->assertCount(1, $data['projectSettings']);
        $this->assertArrayHasKey('interfaceConfig', $data['projectSettings']);

        // Session data should not contain project, an associative array
        $this->assertArrayNotHasKey('project', $data);

        // Session data should contain user site rights, an array of integers
        $this->assertArrayHasKey('userSiteRights', $data);
        $this->assertTrue(is_array($data['userSiteRights']));
        // ... which should not be empty
        $this->assertFalse(empty($data['userSiteRights']));
        $this->assertTrue(is_integer($data['userSiteRights'][0]));

        // Session data should contain user project rights, an array of integers
        $this->assertArrayNotHasKey('userProjectRights', $data);
    }

    /**
     * @throws Exception
     */
    public function testSessionData_userIsPartOfProject()
    {
        $environ = new SessionTestEnvironment();
        $environ->create();
        ProjectCommands::updateUserRole($environ->projectId, $environ->userId);
        $data = SessionCommands::getSessionData($environ->projectId, $environ->userId, $environ->website);

        // Session data should contain user project rights, an array of integers
        $this->assertArrayHasKey('userProjectRights', $data);
        $this->assertTrue(is_array($data['userProjectRights']));
        // ... which should not be empty once the user has been assigned to the project
        $this->assertFalse(empty($data['userProjectRights']));
        $this->assertTrue(is_integer($data['userProjectRights'][0]));
    }

}
