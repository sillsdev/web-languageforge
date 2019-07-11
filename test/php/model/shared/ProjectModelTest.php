<?php

use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ProjectModelTest extends TestCase
{
    private static $savedProjectId;

    public function testWrite_ReadBackSame()
    {
        $model = new ProjectModel();
        $model->language = "SomeLanguage";
        $model->projectName = "SomeProject";
        $model->projectCode = 'project_code';
        //$model->users->refs = array('1234');
        $id = $model->write();
        $this->assertNotNull($id);
        $this->assertIsString($id);
        $this->assertEquals($model->id->asString(), $id);
        $otherModel = new ProjectModel($id);
        $this->assertEquals($id, $otherModel->id->asString());
        $this->assertEquals('SomeLanguage', $otherModel->language);
        $this->assertEquals('SomeProject', $otherModel->projectName);
        //$this->assertEqual(array('1234'), $otherModel->users->refs);

        self::$savedProjectId = $id;
    }

    public function testProjectList_HasCountAndEntries()
    {
        $model = new ProjectListModel();
        $model->read();

        $this->assertNotEquals(0, $model->count);
        $this->assertNotNull($model->entries);
    }

    public function testProjectAddUser_ExistingProject_ReadBackAdded()
    {
        $environ = new MongoTestEnvironment();

        // setup user and projects
        $userId = $environ->createUser('jsmith', 'joe smith', 'joe@email.com');
        $userModel = new UserModel($userId);
        $projectModel = $environ->createProject('new project', 'newProjCode');
        $projectId = $projectModel->id->asString();

        // create the reference
        $projectModel->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $userModel->addProject($projectId);
        $projectModel->write();
        $userModel->write();

        $this->assertArrayHasKey($userId, $projectModel->users, "'$userId' not found in project.");
        $otherProject = new ProjectModel($projectId);
        $this->assertArrayHasKey($userId, $otherProject->users, "'$userId' not found in other project.");
    }

    // TODO move Project <--> User operations to a separate ProjectUserCommands tests

    public function testProjectRemoveUser_ExistingProject_Removed()
    {
        $environ = new MongoTestEnvironment();

        // setup user and projects
        $userId = $environ->createUser('jsmith', 'joe smith', 'joe@email.com');
        $userModel = new UserModel($userId);
        $projectModel = $environ->createProject('new project', 'newProjCode');
        $projectId = $projectModel->id->asString();

        // create the reference
        $projectModel->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $userModel->addProject($projectId);
        $projectModel->write();
        $userModel->write();

        // assert the reference is there
        $this->assertArrayHasKey($userId, $projectModel->users, "'$userId' not found in project.");
        $otherProject = new ProjectModel($projectId);
        $this->assertArrayHasKey($userId, $otherProject->users, "'$userId' not found in other project.");

        // remove the reference
        $projectModel->removeUser($userId);
        $userModel->removeProject($projectId);
        $projectModel->write();
        $userModel->write();

        // testing
        $this->assertArrayNotHasKey($userId, $projectModel->users, "'$userId' not found in project.");
        $otherProject = new ProjectModel(self::$savedProjectId);
        $this->assertArrayNotHasKey($userId, $otherProject->users, "'$userId' not found in other project.");
        new ProjectModel(self::$savedProjectId);
    }

    public function testProjectAddUser_TwiceToSameProject_AddedOnce()
    {
        // note I am not testing the reciprocal reference here - 2013-07-09 CJH
        $environ = new MongoTestEnvironment();

        // setup user and projects
        $userId = $environ->createUser('jsmith', 'joe smith', 'joe@email.com');
        $projectModel = $environ->createProject('new project', 'newProjCode');

        $projectModel->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $this->assertEquals(1, count($projectModel->users));
        $projectModel->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $this->assertEquals(1, count($projectModel->users));
    }

    public function testProjectListUsers_TwoUsers_ListHasDetails()
    {
        $environ = new MongoTestEnvironment();
        $userId1 = $environ->createUser('user1', 'User One', 'user1@example.com');
        $um1 = new UserModel($userId1);
        $userId2 = $environ->createUser('user2', 'User Two', 'user2@example.com');
        $um2 = new UserModel($userId2);
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // Check the list users is empty
        $result = $project->listUsers();
        $this->assertEquals(0, $result->count);
        $this->assertEquals([], $result->entries);

        // Add our two users
        $project->addUser($userId1, ProjectRoles::CONTRIBUTOR);
        $um1->addProject($projectId);
        $um1->write();

        $project->addUser($userId2, ProjectRoles::CONTRIBUTOR);
        $um2->addProject($projectId);
        $um2->write();
        $project->write();

        $otherProject = new ProjectModel($projectId);
        $result = $otherProject->listUsers();
        $this->assertEquals(2, $result->count);
        $this->assertEquals(
            [
                [
                  'email' => 'user1@example.com',
                  'name' => 'User One',
                  'username' => 'user1',
                  'id' => $userId1,
                  'role' => ProjectRoles::CONTRIBUTOR
                ],
                [
                  'email' => 'user2@example.com',
                  'name' => 'User Two',
                  'username' => 'user2',
                  'id' => $userId2,
                  'role' => ProjectRoles::CONTRIBUTOR
                ]
            ],
            $result->entries
        );

    }

    public function testRemove_RemovesProject()
    {
        new MongoTestEnvironment();
        $project = new ProjectModel(self::$savedProjectId);

        $this->assertTrue($project->exists(self::$savedProjectId));

        $project->remove();

        $this->assertFalse($project->exists(self::$savedProjectId));
    }

    public function testDatabaseName_Ok()
    {
        $project = new ProjectModel();
        $project->projectCode = 'Some Project';
        $result = $project->databaseName();
        $this->assertEquals('sf_some_project', $result);
    }

    public function testHasRight_Exception()
    {
        $this->expectException(Exception::class);

        $userId = MongoTestEnvironment::mockId();
        $project = new ProjectModel();
        $project->addUser($userId, ProjectRoles::MANAGER);

        // rolesClass undefined in base ProjectModel
        $project->hasRight($userId, Domain::QUESTIONS + Operation::CREATE);
    }

    public function testGetRolesList_Exception()
    {
        $this->expectException(Exception::class);

        $userId = MongoTestEnvironment::mockId();
        $project = new ProjectModel();
        $project->addUser($userId, ProjectRoles::MANAGER);

        // rolesClass undefined in base ProjectModel
        $project->getRolesList();
    }

    public function testGetRightsArray_Exception()
    {
        $this->expectException(Exception::class);

        $userId = MongoTestEnvironment::mockId();
        $project = new ProjectModel();
        $project->addUser($userId, ProjectRoles::MANAGER);

        // rolesClass undefined in base ProjectModel
        $project->getRightsArray($userId);
    }

    public function testRemoveProject_ProjectHasMembers_UserRefsToProjectAreRemoved()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'user1', 'user1');
        $user = new UserModel($userId);
        $project = $environ->createProject('testProject', 'testProjCode');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $projectId = $project->write();
        $user->addProject($project->id->asString());
        $user->write();

        // delete the project
        $project->remove();

        // re-read the user
        $user = new UserModel($userId);

        $this->assertFalse($user->isMemberOfProject($projectId));
    }
}
