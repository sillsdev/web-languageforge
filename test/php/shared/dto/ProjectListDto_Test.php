<?php

use models\shared\dto\ProjectListDto;
use models\TextModel;
use models\UserModel;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestProjectListDto extends UnitTestCase
{
    public function testEncode_ProjectWithTexts_DtoReturnsTextCount2()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::SYSTEM_ADMIN;
        $user->write();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $text1 = new TextModel($project);
        $text1->title = "Chapter 3";
        $text1->content = "I opened my eyes upon a strange and weird landscape. I knew that I was on Mars; …";
        $text1Id = $text1->write();

        $text2 = new TextModel($project);
        $text2->title = "Chapter 4";
        $text2->content = "We had gone perhaps ten miles when the ground began to rise very rapidly. …";
        $text2Id = $text2->write();

        $dto = ProjectListDto::encode($userId, $e->website);

        $this->assertEqual($dto['count'], 1);
        $this->assertIsA($dto['entries'], 'array');
        $this->assertEqual($dto['entries'][0]['id'], $projectId);
        $this->assertEqual($dto['entries'][0]['projectName'], SF_TESTPROJECT);
        $this->assertEqual($dto['entries'][0]['role'], ProjectRoles::NONE);
    }

    public function testEncode_SystemAdmin2Projects_DtoReturnsProjectCount2()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::SYSTEM_ADMIN;
        $user->write();

        $project1 = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId1 = $project1->id->asString();
        $project1->addUser($userId, ProjectRoles::MANAGER);
        $project1->write();

        $project2 = $e->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);
        $projectId2 = $project2->id->asString();

        $dto = ProjectListDto::encode($userId, $e->website);

        $this->assertEqual($dto['count'], 2);
        $this->assertIsA($dto['entries'], 'array');
        $this->assertEqual($dto['entries'][0]['id'], $projectId1);
        $this->assertEqual($dto['entries'][0]['projectName'], SF_TESTPROJECT);
        $this->assertEqual($dto['entries'][0]['role'], ProjectRoles::MANAGER);
        $this->assertEqual($dto['entries'][1]['id'], $projectId2);
        $this->assertEqual($dto['entries'][1]['projectName'], SF_TESTPROJECT2);
        $this->assertEqual($dto['entries'][1]['role'], ProjectRoles::NONE);
    }

    public function testEncode_SystemAdmin2Projects1Archived_DtoReturnsProjectCount1()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::SYSTEM_ADMIN;
        $user->write();

        $project1 = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId1 = $project1->id->asString();
        $project1->addUser($userId, ProjectRoles::MANAGER);
        $project1->isArchived = true;
        $project1->write();

        $project2 = $e->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);
        $projectId2 = $project2->id->asString();

        $dto = ProjectListDto::encode($userId, $e->website);

        $this->assertEqual($dto['count'], 1);
        $this->assertIsA($dto['entries'], 'array');
        $this->assertEqual($dto['entries'][0]['id'], $projectId2);
        $this->assertEqual($dto['entries'][0]['projectName'], SF_TESTPROJECT2);
        $this->assertEqual($dto['entries'][0]['role'], ProjectRoles::NONE);

        $dto = ProjectListDto::encode($userId, $e->website, true);

        $this->assertEqual($dto['count'], 1);
        $this->assertIsA($dto['entries'], 'array');
        $this->assertEqual($dto['entries'][0]['id'], $projectId1);
        $this->assertEqual($dto['entries'][0]['projectName'], SF_TESTPROJECT);
        $this->assertEqual($dto['entries'][0]['role'], ProjectRoles::MANAGER);
    }

    public function testEncode_UserOf1Project2Projects_DtoReturnsProjectCount1()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;
        $user->write();

        $project1 = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId1 = $project1->id->asString();
        $project1->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project1->write();

        $project2 = $e->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);
        $projectId2 = $project2->id->asString();

        $dto = ProjectListDto::encode($userId, $e->website);

        $this->assertEqual($dto['count'], 1);
        $this->assertIsA($dto['entries'], 'array');
        $this->assertEqual($dto['entries'][0]['id'], $projectId1);
        $this->assertEqual($dto['entries'][0]['projectName'], SF_TESTPROJECT);
        $this->assertEqual($dto['entries'][0]['role'], ProjectRoles::CONTRIBUTOR);
    }

}
