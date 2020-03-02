<?php

use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Dto\ProjectListDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ProjectListDtoTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public function testEncode_ProjectWithTexts_DtoReturnsTextCount2()
    {
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::SYSTEM_ADMIN;
        $user->write();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $project->ownerRef->id = $userId;
        $project->write();

        $text1 = new TextModel($project);
        $text1->title = "Chapter 3";
        $text1->content = "I opened my eyes upon a strange and weird landscape. I knew that I was on Mars; …";
        $text1->write();

        $text2 = new TextModel($project);
        $text2->title = "Chapter 4";
        $text2->content = "We had gone perhaps ten miles when the ground began to rise very rapidly. …";
        $text2->write();

        $dto = ProjectListDto::encode($userId, self::$environ->website);

        $this->assertEquals(1, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $this->assertEquals($projectId, $dto['entries'][0]['id']);
        $this->assertEquals(SF_TESTPROJECT, $dto['entries'][0]['projectName']);
        $this->assertEquals(ProjectRoles::NONE, $dto['entries'][0]['role']);
    }

    public function testEncode_SystemAdmin2Projects_DtoReturnsProjectCount2()
    {
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::SYSTEM_ADMIN;
        $user->write();

        $project1 = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId1 = $project1->id->asString();
        $project1->addUser($userId, ProjectRoles::MANAGER);
        $project1->ownerRef->id = $userId;
        $project1->write();

        $project2 = self::$environ->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);
        $project2->ownerRef->id = $userId;
        $project2->write();
        $projectId2 = $project2->id->asString();

        $dto = ProjectListDto::encode($userId, self::$environ->website);

        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $this->assertEquals($projectId1, $dto['entries'][0]['id']);
        $this->assertEquals(SF_TESTPROJECT, $dto['entries'][0]['projectName']);
        $this->assertEquals(ProjectRoles::MANAGER, $dto['entries'][0]['role']);
        $this->assertEquals($projectId2, $dto['entries'][1]['id']);
        $this->assertEquals(SF_TESTPROJECT2, $dto['entries'][1]['projectName']);
        $this->assertEquals(ProjectRoles::NONE, $dto['entries'][1]['role']);
    }

    public function testEncode_SystemAdmin2Projects1Archived_DtoReturnsProjectCount1()
    {
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::SYSTEM_ADMIN;
        $user->write();

        $project1 = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId1 = $project1->id->asString();
        $project1->addUser($userId, ProjectRoles::MANAGER);
        $project1->isArchived = true;
        $project1->ownerRef->id = $userId;
        $project1->write();

        $project2 = self::$environ->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);
        $project2->ownerRef->id = $userId;
        $projectId2 = $project2->write();

        $dto = ProjectListDto::encode($userId, self::$environ->website);

        $this->assertEquals(1, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $this->assertEquals($projectId2, $dto['entries'][0]['id']);
        $this->assertEquals(SF_TESTPROJECT2, $dto['entries'][0]['projectName']);
        $this->assertEquals(ProjectRoles::NONE, $dto['entries'][0]['role']);

        $dto = ProjectListDto::encode($userId, self::$environ->website, true);

        $this->assertEquals(1, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $this->assertEquals($projectId1, $dto['entries'][0]['id']);
        $this->assertEquals(SF_TESTPROJECT, $dto['entries'][0]['projectName']);
        $this->assertEquals(ProjectRoles::MANAGER, $dto['entries'][0]['role']);
    }

    public function testEncode_UserOf1Project2Projects_DtoReturnsProjectCount1()
    {
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;
        $user->write();

        $project1 = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId1 = $project1->id->asString();
        $project1->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project1->ownerRef->id = $userId;
        $project1->write();

        $project2 = self::$environ->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);
        $project2->ownerRef->id = $userId;
        $project2->write();

        $dto = ProjectListDto::encode($userId, self::$environ->website);

        $this->assertEquals(1, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $this->assertEquals($projectId1, $dto['entries'][0]['id']);
        $this->assertEquals(SF_TESTPROJECT, $dto['entries'][0]['projectName']);
        $this->assertEquals(ProjectRoles::CONTRIBUTOR, $dto['entries'][0]['role']);
    }
}
