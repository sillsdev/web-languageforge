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

    public function __construct() {
        $this->environ = new MongoTestEnvironment();
        $this->environ->clean();
        $this->save = array();
        parent::__construct();
    }

    /**
     * Local store of mock test environment
     *
     * @var MongoTestEnvironment
     */
    private $environ;

    /**
     * Data storage between tests
     *
     * @var array <unknown>
     */
    private $save;

    public function testDeleteProjects_NoThrow()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        ProjectCommands::deleteProjects(array($projectId));
    }

    public function testArchiveProjects_PublishedProject_ProjectArchived()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertFalse($project->isArchived);

        $count = ProjectCommands::archiveProjects(array($projectId));

        $project->read($projectId);
        $this->assertEqual($count, 1);
        $this->assertTrue($project->isArchived);
    }

    public function testPublishProjects_ArchivedProject_ProjectPublished()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->environ->clean();

        // setup parameters: user, project and params
        $userId = $this->environ->createUser("existinguser", "Existing Name", "existing@example.com");
        $user = new UserModel($userId);
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $userProject = $updatedUser->listProjects($this->environ->website->domain)->entries[0];
        $this->assertEqual($userProject['projectName'], SF_TESTPROJECT);
    }

    public function testUpdateUserRole_JoinTwice_JoinedOnce()
    {
        $this->environ->clean();

        // setup user and project
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $userId = $this->environ->createUser("existinguser", "Existing Name", "existing@example.com");
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
        $this->assertEqual($sameUser->listProjects($this->environ->website->domain)->count, 1);

        // update user role in project again
        $updatedUserId = ProjectCommands::updateUserRole($projectId, $userId);

        // read from disk again
        $sameProject->read($projectId);
        $sameUser->read($updatedUserId);

        // user still in project once and project still has one user
        $this->assertEqual($sameProject->listUsers()->count, 1);
        $this->assertEqual($sameUser->listProjects($this->environ->website->domain)->count, 1);
    }

    public function testRemoveUsers_NoUsers_NoThrow()
    {
        $this->environ->clean();

        // setup parameters: project and users
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $userIds = array();

        // there are no users in project
        $this->assertEqual($project->listUsers()->count, 0);

        // remove users from project with no users - no throw expected
        ProjectCommands::removeUsers($projectId, $userIds);
    }

    public function testReadSettings_CanReadSettings()
    {
        $this->environ->clean();

        // setup project and users
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $projectSettings = new ProjectSettingsModel($projectId);
        $projectSettings->smsSettings->accountId = "12345";
        $projectSettings->write();

        $user1Id = $this->environ->createUser("user1name", "User1 Name", "user1@example.com");

        $result = ProjectCommands::readProjectSettings($projectId, $user1Id);

        $this->assertEqual($result['sms']['accountId'], "12345");
    }

    public function testRemoveUsers_UsersInProject_RemovedFromProject()
    {
        $this->environ->clean();

        // setup project and users
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user1Id = $this->environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = $this->environ->createUser("user2name", "User2 Name", "user2@example.com");
        $user3Id = $this->environ->createUser("user3name", "User3 Name", "user3@example.com");
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
        $user1Project = $otherUser1->listProjects($this->environ->website->domain)->entries[0];
        $this->assertEqual($user1Project['projectName'], SF_TESTPROJECT);
        $user2Project = $otherUser1->listProjects($this->environ->website->domain)->entries[0];
        $this->assertEqual($user2Project['projectName'], SF_TESTPROJECT);
        $user3Project = $otherUser1->listProjects($this->environ->website->domain)->entries[0];
        $this->assertEqual($user3Project['projectName'], SF_TESTPROJECT);
        $projectUser1 = $otherProject->listUsers()->entries[0];
        $this->assertEqual($projectUser1['username'], "user1name");
        $projectUser2 = $otherProject->listUsers()->entries[1];
        $this->assertEqual($projectUser2['username'], "user2name");
        $projectUser3 = $otherProject->listUsers()->entries[2];
        $this->assertEqual($projectUser3['username'], "user3name");

        // remove users from project
        $userIds = array($user1->id->asString(), $user2->id->asString(), $user3->id->asString());
        ProjectCommands::removeUsers($projectId, $userIds);

        // read from disk
        $sameProject = new ProjectModel($projectId);
        $sameUser1 = new UserModel($user1Id);
        $sameUser2 = new UserModel($user2Id);
        $sameUser3 = new UserModel($user3Id);

        // project has no users, each user not in project
        $this->assertEqual($sameProject->listUsers()->count, 0);
        $this->assertEqual($sameUser1->listProjects($this->environ->website->domain)->count, 0);
        $this->assertEqual($sameUser2->listProjects($this->environ->website->domain)->count, 0);
        $this->assertEqual($sameUser3->listProjects($this->environ->website->domain)->count, 0);
    }

    public function testRemoveUsers_ProjectOwner_NotRemovedFromProject()
    {
        $this->environ->clean();

        // setup project and users.  user1 is the project owner
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user1Id = $this->environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = $this->environ->createUser("user2name", "User2 Name", "user2@example.com");
        $user1 = new UserModel($user1Id);
        $user2 = new UserModel($user2Id);
        $project->addUser($user1->id->asString(), ProjectRoles::CONTRIBUTOR);
        $project->addUser($user2->id->asString(), ProjectRoles::CONTRIBUTOR);
        $project->ownerRef = $user2Id;
        $project->write();
        $user1->addProject($project->id->asString());
        $user1->write();
        $user2->addProject($project->id->asString());
        $user2->write();

        // save data for rest of this test
        $this->save['projectId'] = $projectId;
        $this->save['user1Id'] = $user1Id;
        $this->save['user2Id'] = $user2Id;

        // remove users from project.  user1 still remains as project owner
        $userIds = array($user1->id->asString(), $user2->id->asString());
        $this->expectException();
        $this->environ->inhibitErrorDisplay();
        ProjectCommands::removeUsers($projectId, $userIds);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testRemoveUsers_ProjectOwner_NotRemovedFromProject
    public function testRemoveUsers_ProjectOwner_NotRemovedFromProject_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();

        // read from disk
        $sameProject = new ProjectModel($this->save['projectId']);
        $sameUser1 = new UserModel($this->save['user1Id']);
        $sameUser2 = new UserModel($this->save['user2Id']);

        // project still has project owner
        $this->assertEqual($sameProject->listUsers()->count, 1);
        $this->assertEqual($sameUser1->listProjects($this->environ->website->domain)->count, 0);
        $this->assertEqual($sameUser2->listProjects($this->environ->website->domain)->count, 1);
    }

    public function testProjectCodeExists_codeExists_true()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->write();

        $this->assertTrue(ProjectCommands::projectCodeExists(SF_TESTPROJECTCODE));
    }

    public function testProjectCodeExists_codeDoesNotExist_false()
    {
        $this->environ->clean();

        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->write();

        $this->assertFalse(ProjectCommands::projectCodeExists('randomcode'));
    }

    public function testCreateProject_newProject_projectOwnerSet()
    {
        $this->environ->clean();

        $user1Id = $this->environ->createUser("user1name", "User1 Name", "user1@example.com");

        $user1 = new UserModel($user1Id);
        $projectID = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $user1->id->asString(), $this->environ->website);

        $projectModel = new ProjectModel($projectID);
        $this->assertTrue($projectModel->ownerRef->asString() == $user1->id->asString());
    }

}
