<?php

use Api\Model\Languageforge\Lexicon\Dto\LexProjectDto;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class LexProjectDtoTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
    }

    public function testEncode_Project_DtoCorrect()
    {
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $project->interfaceLanguageCode = 'en';
        $project->projectCode = 'lf';
        $project->featured = true;

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $dto = LexProjectDto::encode($projectId);

        // test for a few default values
        $this->assertEquals('en', $dto['project']['interfaceLanguageCode']);
        $this->assertEquals('lf', $dto['project']['projectCode']);
        $this->assertTrue($dto['project']['featured']);
        $this->assertArrayNotHasKey('sendReceive', $dto['project']);
    }

    public function testEncode_ProjectWithSendReceive_DtoCorrect()
    {
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $project->interfaceLanguageCode = 'en';
        $project->projectCode = 'lf';
        $project->featured = true;
        $project->sendReceiveProjectIdentifier = 'test-sr-identifier';
        $project->sendReceiveProject = new SendReceiveProjectModel('test-sr-name', '', 'manager');

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $dto = LexProjectDto::encode($projectId);

        // test for a few default values
        $this->assertEquals('en', $dto['project']['interfaceLanguageCode']);
        $this->assertEquals('lf', $dto['project']['projectCode']);
        $this->assertTrue($dto['project']['featured']);
        $this->assertEquals('test-sr-identifier', $dto['project']['sendReceive']['project']['identifier']);
    }
}
