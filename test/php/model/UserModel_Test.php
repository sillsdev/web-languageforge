<?php

use Api\Library\Shared\Website;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\UserModel;
use Api\Model\UserTypeaheadModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';
require_once SourcePath . "Api/Model/ProjectModel.php";
require_once SourcePath . "Api/Model/UserModel.php";

class TestUserModel extends UnitTestCase
{
    private $_someUserId;

    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        parent::__construct();
    }

    public function testWrite_ReadBackSame()
    {
        $user = new UserModel();
        $user->email = "user@example.com";
        $user->username = "SomeUser";
        $user->name = "Some User";
        $user->avatar_ref = "Site/views/shared/image/avatar/pinkbat.png";
        $id = $user->write();
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual($id, $user->id);
        $otherModel = new UserModel($id);
        $this->assertEqual($id, $otherModel->id);
        $this->assertEqual('user@example.com', $otherModel->email);
        $this->assertEqual('SomeUser', $otherModel->username);
        $this->assertEqual('Some User', $otherModel->name);
        $this->assertEqual('Site/views/shared/image/avatar/pinkbat.png', $otherModel->avatar_ref);

        $this->_someUserId = $id;
    }

    public function testUserTypeahead_HasSomeEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $e->createUser('someuser', 'Some User','user@example.com');

        $model = new UserTypeaheadModel('', '', $e->website);
        $model->read();

        $this->assertEqual(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEqual('Some User', $model->entries[0]['name']);
    }

    public function testUserTypeahead_HasMatchingEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $e->createUser('someuser', 'Some User','user@example.com');

        $model = new UserTypeaheadModel('', '', $e->website);
        $model->read();

        $this->assertEqual(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEqual('Some User', $model->entries[0]['name']);
    }

    public function testUserTypeahead_HasNoMatchingEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $e->createUser('someuser', 'Some User','user@example.com');

        $model = new UserTypeaheadModel('Bogus', '', $e->website);
        $model->read();

        $this->assertEqual(0, $model->count);
        $this->assertEqual(array(), $model->entries);
    }

    public function testUserTypeahead_CrossSiteNoMatchingEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $e->createUser('someuser', 'Some User','user@example.com');

        // Check no users exist on another website
        $website = new Website('languageforge.local', Website::LANGUAGEFORGE);
        $model = new UserTypeaheadModel('some', '', $website);
        $model->read();

        $this->assertEqual(0, $model->count);
        $this->assertEqual(array(), $model->entries);
    }

    public function testUserTypeahead_ExcludeProject_UserExcluded()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('projectuser', 'Project User','projectUser@example.com');
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user = new UserModel($userId);
        $user->addProject($projectId);
        $user->write();
        $e->createUser('someuser', 'Some User','user@example.com');
        $e->createUser('anotheruser', 'Another User','another@example.com');

        $model = new UserTypeaheadModel('', $projectId, $e->website);
        $model->read();

        $this->assertEqual(2, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEqual('Some User', $model->entries[0]['name']);
        $this->assertEqual('Another User', $model->entries[1]['name']);

        $model = new UserTypeaheadModel('Some', $projectId, $e->website);
        $model->read();

        $this->assertEqual(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEqual('Some User', $model->entries[0]['name']);
    }

    public function testUserListProjects_TwoProjects_ListHasDetails()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('jsmith', 'joe smith', 'joe@smith.com');

        $p1m = $e->createProject('p1', 'p1Code');
        $p1m->appName = 'sfchecks';
        $p1m->ownerRef->id = $userId;

        $p1m->write();
        $p1 = $p1m->id->asString();
        $p2m = $e->createProject('p2', 'p2Code');
        $p2 = $p2m->id->asString();
        $p2m->appName = 'sfchecks';
        $p2m->ownerRef->id = $userId;
        $p2m->write();

        $userModel = new UserModel($userId);

        // Check that list projects is empty
        $result = $userModel->listProjects($e->website->domain);
        $this->assertEqual(0, $result->count);
        $this->assertEqual(array(), $result->entries);

        // Add our two projects
        $p1m->addUser($userModel->id->asString(), ProjectRoles::MANAGER);
        $userModel->addProject($p1m->id->asString());
        $p2m->addUser($userModel->id->asString(), ProjectRoles::MANAGER);
        $userModel->addProject($p2m->id->asString());
        $p1m->write();
        $p2m->write();
        $userModel->write();

        $result = $userModel->listProjects($e->website->domain);
        $this->assertEqual(2, $result->count);
        $this->assertEqual(
            array(
                array(
                    'projectName' => 'p1',
                    'ownerRef' => $userId,
                    'id' => $p1,
                    'appName' => 'sfchecks',
                    'siteName' => $e->website->domain
                ),
                array(
                    'projectName' => 'p2',
                    'ownerRef' => $userId,
                    'id' => $p2,
                    'appName' => 'sfchecks',
                    'siteName' => $e->website->domain
                )
            ), $result->entries
        );
    }

    public function testReadByUserName_userFound_UserModelPopulated()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $emailAddress = 'joe@smith.com';
        $e->createUser('jsmith', 'joe smith', $emailAddress);

        $user = new UserModel();
        $result = $user->readByUserName('jsmith');
        $this->assertTrue($result);
        $this->assertEqual($user->email, $emailAddress);
    }

    public function testReadByUserName_userNotFound_EmptyModel()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $e->createUser('jsmith', 'joe smith','joe@smith.com');

        $user = new UserModel();
        $result = $user->readByUserName('adam');
        $this->assertFalse($result);
        $this->assertEqual($user->email, '');
    }

    public function testUserRemove_UserMemberOfProject_ProjectLinkRemovedAsWell()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user1', 'user1', 'user1');
        $user = new UserModel($userId);
        $project = $e->createProject('testProject', 'testProjectCode');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();
        $user->addProject($project->id->asString());
        $user->write();

        // delete the user
        $user->remove();

        // re-read the project
        $project->read($project->id->asString());

        $this->assertFalse($project->userIsMember($userId));

    }

    public function testHasForgottenPassword_KeyNotSetNoKeyConsume_HasNotForgotten()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user1', 'User1', 'user1');
        $user = new UserModel($userId);

        $hasForgottenPassword = $user->hasForgottenPassword(false);

        $this->assertFalse($hasForgottenPassword);
        $this->assertFalse($user->resetPasswordKey);
        $this->assertIsA($user->resetPasswordExpirationDate, 'DateTime');
    }

    public function testHasForgottenPassword_KeySetNoKeyConsume_HasForgottenKeyNotConsumed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user1', 'User1', 'user1');
        $user = new UserModel($userId);
        $user->setForgotPassword(7);
        $user->write();

        $hasForgottenPassword = $user->hasForgottenPassword(false);

        $this->assertTrue($hasForgottenPassword);
        $this->assertTrue($user->resetPasswordKey);
        $today = new \DateTime();
        $future = $today->add(new DateInterval('P7D'));
        $hourMargin = 60;
        $this->assertWithinMargin($user->resetPasswordExpirationDate->getTimestamp(), $future->getTimestamp(), $hourMargin);
    }

    public function testHasForgottenPassword_KeySetConsumeKey_HasForgottenKeyConsumed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user1', 'User1', 'user1');
        $user = new UserModel($userId);
        $user->setForgotPassword(7);
        $user->write();

        $hasForgottenPassword = $user->hasForgottenPassword(true);

        $this->assertTrue($hasForgottenPassword);
        $this->assertFalse($user->resetPasswordKey);
        $today = new \DateTime();
        $hourMargin = 60;
        $this->assertWithinMargin($user->resetPasswordExpirationDate->getTimestamp(), $today->getTimestamp(), $hourMargin);
    }
/*
    function testWriteRemove_ListCorrect()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $list = new UserListModel();
        $list->read();
        $this->assertEqual(0, $list->count);
        $this->assertEqual(null, $list->entries);

        $user = new UserModel();
        $user->name = "Some Name";
        $id = $user->write();

        $list = new UserListModel();
        $list->read();
        $this->assertEqual(1, $list->count);
        $this->assertEqual(
            array(array(
                'avatar_ref' => null,
                'email' => null,
                'name' => 'Some Name',
                'username' => null,
                'id' => $id
            )),
            $list->entries
        );
        $user->remove();

        $list = new UserListModel();
        $list->read();
        $this->assertEqual(0, $list->count);
        $this->assertEqual(null, $list->entries);
    }
    */
}
