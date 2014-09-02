<?php

use libraries\shared\Website;
use models\shared\rights\ProjectRoles;
use models\commands\ProjectCommands;
use models\mapper\Id;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\UserModel;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestProjectCommands extends UnitTestCase
{
    public function testDeleteProjects_NoThrow()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        ProjectCommands::deleteProjects(array($projectId));
    }

    public function testArchiveProjects_PublishedProject_ProjectArchived()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertFalse($project->isArchived);

        $count = ProjectCommands::archiveProjects(array($projectId));

        $project->read($projectId);
        $this->assertEqual($count, 1);
        $this->assertTrue($project->isArchived);
    }

    public function testPublishProjects_ArchivedProject_ProjectPublished()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->isArchived = true;
        $projectId = $project->write();

        $this->assertTrue($project->isArchived);

        $count = ProjectCommands::publishProjects(array($projectId));

        $project->read($projectId);
        $this->assertEqual($count, 1);
        $this->assertFalse($project->isArchived);
    }

    public function testUpdateUserRole_UpdateUserInProject_UserJoinedProject()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // setup parameters: user, project and params
        $userId = $e->createUser("existinguser", "Existing Name", "existing@example.com");
        $user = new UserModel($userId);
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $params = array(
                'id' => $user->id->asString(),
                'role' => ProjectRoles::MANAGER,
        );

        // update user role in project
        $updatedUserId = ProjectCommands::updateUserRole($projectId, $user->id->asString(), ProjectRoles::MANAGER);

        // read from disk
        $updatedUser = new UserModel($updatedUserId);
        $sameProject = new ProjectModel($projectId);

        // user updated and joined to project
        $this->assertEqual($updatedUser->id, $userId);
        $this->assertNotEqual($updatedUser->role, ProjectRoles::MANAGER);
        $projectUser = $sameProject->listUsers()->entries[0];
        $this->assertEqual($projectUser['name'], "Existing Name");
        $userProject = $updatedUser->listProjects($e->website->domain)->entries[0];
        $this->assertEqual($userProject['projectName'], SF_TESTPROJECT);
    }

    public function testUpdateUserRole_JoinTwice_JoinedOnce()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // setup user and project
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $userId = $e->createUser("existinguser", "Existing Name", "existing@example.com");
        $params = array(
                'id' => $userId,
        );

        // update user role in project once
        $updatedUserId = ProjectCommands::updateUserRole($projectId, $userId);

        // read from disk
        $sameUser = new UserModel($updatedUserId);
        $sameProject = new ProjectModel($projectId);

        // user in project once and project has one user
        $this->assertEqual($sameProject->listUsers()->count, 1);
        $this->assertEqual($sameUser->listProjects($e->website->domain)->count, 1);

        // update user role in project again
        $updatedUserId = ProjectCommands::updateUserRole($projectId, $userId);

        // read from disk again
        $sameProject->read($projectId);
        $sameUser->read($updatedUserId);

        // user still in project once and project still has one user
        $this->assertEqual($sameProject->listUsers()->count, 1);
        $this->assertEqual($sameUser->listProjects($e->website->domain)->count, 1);
    }

    public function testRemoveUsers_NoUsers_NoThrow()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // setup parameters: project and users
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $userIds = array();

        // there are no users in project
        $this->assertEqual($project->listUsers()->count, 0);

        // remove users from project with no users - no throw expected
        ProjectCommands::removeUsers($projectId, $userIds, 'bogus auth userid');
    }

    public function testReadSettings_CanReadSettings()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // setup project and users
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $projectSettings = new ProjectSettingsModel($projectId);
        $projectSettings->smsSettings->accountId = "12345";
        $projectSettings->write();

        $user1Id = $e->createUser("user1name", "User1 Name", "user1@example.com");

        $result = ProjectCommands::readProjectSettings($projectId, $user1Id);

        $this->assertEqual($result['sms']['accountId'], "12345");
    }

    public function testRemoveUsers_UsersInProject_RemovedFromProject()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // setup project and users
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user1Id = $e->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = $e->createUser("user2name", "User2 Name", "user2@example.com");
        $user3Id = $e->createUser("user3name", "User3 Name", "user3@example.com");
        $user1 = new UserModel($user1Id);
        $user2 = new UserModel($user2Id);
        $user3 = new UserModel($user3Id);
        $project->addUser($user1->id->asString(), ProjectRoles::CONTRIBUTOR);
        $project->addUser($user2->id->asString(), ProjectRoles::CONTRIBUTOR);
        $project->addUser($user3->id->asString(), ProjectRoles::CONTRIBUTOR);
        $project->write();
        $user1->addProject($project->id->asString());
        $user1->write();
        $user2->addProject($project->id->asString());
        $user2->write();
        $user3->addProject($project->id->asString());
        $user3->write();

        // read from disk
        $otherProject = new ProjectModel($projectId);
        $otherUser1 = new UserModel($user1Id);
        $otherUser2 = new UserModel($user2Id);
        $otherUser3 = new UserModel($user3Id);

        // each user in project, project has each user
        $user1Project = $otherUser1->listProjects($e->website->domain)->entries[0];
        $this->assertEqual($user1Project['projectName'], SF_TESTPROJECT);
        $user2Project = $otherUser1->listProjects($e->website->domain)->entries[0];
        $this->assertEqual($user2Project['projectName'], SF_TESTPROJECT);
        $user3Project = $otherUser1->listProjects($e->website->domain)->entries[0];
        $this->assertEqual($user3Project['projectName'], SF_TESTPROJECT);
        $projectUser1 = $otherProject->listUsers()->entries[0];
        $this->assertEqual($projectUser1['username'], "user1name");
        $projectUser2 = $otherProject->listUsers()->entries[1];
        $this->assertEqual($projectUser2['username'], "user2name");
        $projectUser3 = $otherProject->listUsers()->entries[2];
        $this->assertEqual($projectUser3['username'], "user3name");

        // remove users from project
        $userIds = array($user1->id->asString(), $user2->id->asString(), $user3->id->asString());
        ProjectCommands::removeUsers($projectId, $userIds, 'bogus auth userids');

        // read from disk
        $sameProject = new ProjectModel($projectId);
        $sameUser1 = new UserModel($user1Id);
        $sameUser2 = new UserModel($user2Id);
        $sameUser3 = new UserModel($user3Id);

        // project has no users, each user not in project
        $this->assertEqual($sameProject->listUsers()->count, 0);
        $this->assertEqual($sameUser1->listProjects($e->website->domain)->count, 0);
        $this->assertEqual($sameUser2->listProjects($e->website->domain)->count, 0);
        $this->assertEqual($sameUser3->listProjects($e->website->domain)->count, 0);
    }

    public function testRemoveUsers_ProjectOwner_NotRemovedFromProject()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // setup project and users.  user1 is the project owner
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user1Id = $e->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = $e->createUser("user2name", "User2 Name", "user2@example.com");
        $user1 = new UserModel($user1Id);
        $user2 = new UserModel($user2Id);
        $project->addUser($user1->id->asString(), ProjectRoles::CONTRIBUTOR);
        $project->addUser($user2->id->asString(), ProjectRoles::CONTRIBUTOR);
        $project->ownerRef = $user1Id;
        $project->write();
        $user1->addProject($project->id->asString());
        $user1->write();
        $user2->addProject($project->id->asString());
        $user2->write();

        // remove users from project.  user1 still remains as project owner
        $userIds = array($user1->id->asString(), $user2->id->asString());
        $this->expectException();
        $e->inhibitErrorDisplay();
        ProjectCommands::removeUsers($projectId, $userIds, 'bogus auth userids');
        $e->restoreErrorDisplay();
        // read from disk
        $sameProject = new ProjectModel($projectId);
        $sameUser1 = new UserModel($user1Id);
        $sameUser2 = new UserModel($user2Id);

        // project still has project owner
        $this->assertEqual($sameProject->listUsers()->count, 1);
        $this->assertEqual($sameUser1->listProjects($e->website->domain)->count, 1);
        $this->assertEqual($sameUser2->listProjects($e->website->domain)->count, 0);
    }

    public function testProjectCodeExists_codeExists_true()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->write();

        $this->assertTrue(ProjectCommands::projectCodeExists(SF_TESTPROJECTCODE));
    }

    public function testProjectCodeExists_codeDoesNotExist_false()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->write();

        $this->assertFalse(ProjectCommands::projectCodeExists('randomcode'));
    }

    public function testCreateProject_newProject_projectOwnerSet()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $user1Id = $e->createUser("user1name", "User1 Name", "user1@example.com");

        $user1 = new UserModel($user1Id);
        $projectID = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $user1->id->asString(), $e->website);

        $projectModel = new ProjectModel($projectID);
        $this->assertTrue($projectModel->ownerRef->asString() == $user1->id->asString());
    }

}
