<?php

use libraries\shared\Website;
use models\shared\rights\ProjectRoles;
use models\mapper\Id;
use models\ProjectModel;
use models\UserListModel;
use models\UserModel;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';
require_once SourcePath . "models/ProjectModel.php";
require_once SourcePath . "models/UserModel.php";

class TestUserModel extends UnitTestCase
{
    private $_someUserId;
    private $_e;

    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
    }

    public function testWrite_ReadBackSame()
    {
        $user = new UserModel();
        $user->email = "user@example.com";
        $user->username = "SomeUser";
        $user->name = "Some User";
        $user->avatar_ref = "images/avatar/pinkbat.png";
        $id = $user->write();
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual($id, $user->id);
        $otherModel = new UserModel($id);
        $this->assertEqual($id, $otherModel->id);
        $this->assertEqual('user@example.com', $otherModel->email);
        $this->assertEqual('SomeUser', $otherModel->username);
        $this->assertEqual('Some User', $otherModel->name);
        $this->assertEqual('images/avatar/pinkbat.png', $otherModel->avatar_ref);

        $this->_someUserId = $id;
    }

    public function testUserTypeahead_HasSomeEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('someuser', 'Some User','user@example.com');
        $someUser = new UserModel($userId);

        $model = new models\UserTypeaheadModel('', '', $e->website);
        $model->read();

        $this->assertEqual(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEqual('Some User', $model->entries[0]['name']);
    }

    public function testUserTypeahead_HasMatchingEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('someuser', 'Some User','user@example.com');
        $someUser = new UserModel($userId);

        $model = new models\UserTypeaheadModel('', '', $e->website);
        $model->read();

        $this->assertEqual(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEqual('Some User', $model->entries[0]['name']);
    }

    public function testUserTypeahead_HasNoMatchingEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('someuser', 'Some User','user@example.com');
        $someUser = new UserModel($userId);

        $model = new models\UserTypeaheadModel('Bogus', '', $e->website);
        $model->read();

        $this->assertEqual(0, $model->count);
        $this->assertEqual(array(), $model->entries);
    }

    public function testUserTypeahead_CrossSiteNoMatchingEntries()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('someuser', 'Some User','user@example.com');
        $someUser = new UserModel($userId);

        // Check no users exist on another website
        $website = new Website('languageforge.local', Website::LANGUAGEFORGE);
        $model = new models\UserTypeaheadModel('some', '', $website);
        $model->read();

        $this->assertEqual(0, $model->count);
        $this->assertEqual(array(), $model->entries);
    }

    public function testUserListProjects_TwoProjects_ListHasDetails()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $p1m = $e->createProject('p1', 'p1Code');
        $p1m->appName = 'sfchecks';
        $p1m->write();
        $p1 = $p1m->id->asString();
        $p2m = $e->createProject('p2', 'p2Code');
        $p2 = $p2m->id->asString();
        $p2m->appName = 'sfchecks';
        $p2m->write();

        $userId = $e->createUser('jsmith', 'joe smith', 'joe@smith.com');
        $userModel = new UserModel($userId);

        // Check that list projects is empty
        $result = $userModel->listProjects($e->website->domain);
        $this->assertEqual(0, $result->count);
        $this->assertEqual(array(), $result->entries);

        // Add our two projects
        $p1m->addUser($userModel->id->asString(), ProjectRoles::CONTRIBUTOR);
        $userModel->addProject($p1m->id->asString());
        $p2m->addUser($userModel->id->asString(), ProjectRoles::CONTRIBUTOR);
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
                  'id' => $p1,
                  'appName' => 'sfchecks',
                  'siteName' => $e->website->domain
                ),
                array(
                  'projectName' => 'p2',
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
