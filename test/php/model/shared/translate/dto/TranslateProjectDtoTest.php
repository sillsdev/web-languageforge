<?php

use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\Translate\Dto\TranslateProjectDto;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class TranslateProjectDtoTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new MongoTestEnvironment();
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
        $project->projectCode = 'translate';
        $project->featured = true;

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $dto = TranslateProjectDto::encode($projectId, $userId);

        // test for a few default values
        $this->assertEquals('en', $dto['project']['interfaceLanguageCode']);
        $this->assertEquals('translate', $dto['project']['projectCode']);
        $this->assertTrue($dto['project']['featured']);
        $this->assertArrayHasKey('config', $dto['project']);
        $this->assertArrayHasKey('source', $dto['project']['config']);
        $this->assertArrayHasKey('target', $dto['project']['config']);
        $this->assertArrayHasKey('documentSets', $dto['project']['config']);
        $this->assertArrayHasKey('confidenceThreshold', $dto['project']['config']);
        $this->assertArrayNotHasKey('userPreferences', $dto['project']['config']);
        $this->assertArrayNotHasKey('usersPreferences', $dto['project']['config']);
    }
}
