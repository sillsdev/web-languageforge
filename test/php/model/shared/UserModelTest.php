<?php

use Api\Library\Shared\Website;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserTypeaheadModel;
use PHPUnit\Framework\TestCase;

class UserModelTest extends TestCase
{
    public function testWrite_ReadBackSame()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $user = new UserModel();
        $user->email = "user@example.com";
        $user->username = "SomeUser";
        $user->name = "Some User";
        $user->avatar_ref = "Site/views/shared/image/avatar/pinkbat.png";
        $id = $user->write();
        $this->assertNotNull($id);
        $this->assertInternalType('string', $id);
        $this->assertEquals($user->id, $id);
        $otherModel = new UserModel($id);
        $this->assertEquals($id, $otherModel->id);
        $this->assertEquals('user@example.com', $otherModel->email);
        $this->assertEquals('SomeUser', $otherModel->username);
        $this->assertEquals('Some User', $otherModel->name);
        $this->assertEquals('Site/views/shared/image/avatar/pinkbat.png', $otherModel->avatar_ref);
    }

    public function testUserTypeahead_HasSomeEntries()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $environ->createUser('someuser', 'Some User','user@example.com');

        $model = new UserTypeaheadModel('', '', $environ->website);
        $model->read();

        $this->assertEquals(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEquals('Some User', $model->entries[0]['name']);
    }

    public function testUserTypeahead_HasMatchingEntries()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $environ->createUser('someuser', 'Some User','user@example.com');

        $model = new UserTypeaheadModel('', '', $environ->website);
        $model->read();

        $this->assertEquals(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEquals('Some User', $model->entries[0]['name']);
    }

    public function testUserTypeahead_HasNoMatchingEntries()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $environ->createUser('someuser', 'Some User','user@example.com');

        $model = new UserTypeaheadModel('Bogus', '', $environ->website);
        $model->read();

        $this->assertEquals(0, $model->count);
        $this->assertEquals([], $model->entries);
    }

    public function testUserTypeahead_CrossSiteNoMatchingEntries()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $environ->createUser('someuser', 'Some User','user@example.com');

        // Check no users exist on another website
        $website = new Website('languageforge.local', Website::LANGUAGEFORGE);
        $model = new UserTypeaheadModel('some', '', $website);
        $model->read();

        $this->assertEquals(0, $model->count);
        $this->assertEquals([], $model->entries);
    }

    public function testUserTypeahead_ExcludeProject_UserExcluded()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('projectuser', 'Project User','projectUser@example.com');
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user = new UserModel($userId);
        $user->addProject($projectId);
        $user->write();
        $environ->createUser('someuser', 'Some User','user@example.com');
        $environ->createUser('anotheruser', 'Another User','another@example.com');

        $model = new UserTypeaheadModel('', $projectId, $environ->website);
        $model->read();

        $this->assertEquals(2, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEquals('Some User', $model->entries[0]['name']);
        $this->assertEquals('Another User', $model->entries[1]['name']);

        $model = new UserTypeaheadModel('Some', $projectId, $environ->website);
        $model->read();

        $this->assertEquals(1, $model->count);
        $this->assertNotNull($model->entries);
        $this->assertEquals('Some User', $model->entries[0]['name']);
    }

    public function testUserListProjects_TwoProjects_ListHasDetails()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser('jsmith', 'joe smith', 'joe@smith.com');

        $p1m = $environ->createProject('p1', 'p1Code');
        $p1m->appName = 'sfchecks';
        $p1m->ownerRef->id = $userId;

        $p1m->write();
        $p1 = $p1m->id->asString();
        $p2m = $environ->createProject('p2', 'p2Code');
        $p2 = $p2m->id->asString();
        $p2m->appName = 'sfchecks';
        $p2m->ownerRef->id = $userId;
        $p2m->write();

        $userModel = new UserModel($userId);

        // Check that list projects is empty
        $result = $userModel->listProjects($environ->website->domain);
        $this->assertEquals(0, $result->count);
        $this->assertEquals([], $result->entries);

        // Add our two projects
        $p1m->addUser($userModel->id->asString(), ProjectRoles::MANAGER);
        $userModel->addProject($p1m->id->asString());
        $p2m->addUser($userModel->id->asString(), ProjectRoles::MANAGER);
        $userModel->addProject($p2m->id->asString());
        $p1m->write();
        $p2m->write();
        $userModel->write();

        $result = $userModel->listProjects($environ->website->domain);
        $this->assertEquals(2, $result->count);
        $this->assertEquals(
            [
                [
                    'projectName' => 'p1',
                    'ownerRef' => $userId,
                    'id' => $p1,
                    'appName' => 'sfchecks',
                    'siteName' => $environ->website->domain
                ],
                [
                    'projectName' => 'p2',
                    'ownerRef' => $userId,
                    'id' => $p2,
                    'appName' => 'sfchecks',
                    'siteName' => $environ->website->domain
                ]
            ],
            $result->entries
        );
    }

    public function testReadByUserName_userFound_UserModelPopulated()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $environmailAddress = 'joe@smith.com';
        $environ->createUser('jsmith', 'joe smith', $environmailAddress);

        $user = new UserModel();
        $result = $user->readByUserName('jsmith');
        $this->assertTrue($result);
        $this->assertEquals($environmailAddress, $user->email);
    }

    public function testReadByUserName_userNotFound_EmptyModel()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $user = new UserModel();
        $result = $user->readByUserName('adam');
        $this->assertFalse($result);
        $this->assertEquals('', $user->email);
    }

    public function testUserRemove_UserMemberOfProject_ProjectLinkRemovedAsWell()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'user1', 'user1');
        $user = new UserModel($userId);
        $project = $environ->createProject('testProject', 'testProjectCode');
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
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1');
        $user = new UserModel($userId);

        $hasForgottenPassword = $user->hasForgottenPassword(false);

        $this->assertFalse($hasForgottenPassword);
        $this->assertNull($user->resetPasswordKey);
        $this->assertInstanceOf(\DateTime::class, $user->resetPasswordExpirationDate);
    }

    public function testHasForgottenPassword_KeySetNoKeyConsume_HasForgottenKeyNotConsumed()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1');
        $user = new UserModel($userId);
        $user->setForgotPassword(7);
        $user->write();

        $hasForgottenPassword = $user->hasForgottenPassword(false);

        $this->assertTrue($hasForgottenPassword);
        $this->assertNotNull($user->resetPasswordKey);
        $this->assertNotEmpty($user->resetPasswordKey);
        $today = new \DateTime();
        $future = $today->add(new DateInterval('P7D'));
        $hourMargin = 60;
        $this->assertEquals($user->resetPasswordExpirationDate->getTimestamp(), $future->getTimestamp(), '', $hourMargin);
    }

    public function testHasForgottenPassword_KeySetConsumeKey_HasForgottenKeyConsumed()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1');
        $user = new UserModel($userId);
        $user->setForgotPassword(7);
        $user->write();

        $hasForgottenPassword = $user->hasForgottenPassword(true);

        $this->assertTrue($hasForgottenPassword);
        $this->assertEmpty($user->resetPasswordKey);
        $today = new \DateTime();
        $hourMargin = 60;
        $this->assertEquals($user->resetPasswordExpirationDate->getTimestamp(), $today->getTimestamp(), '', $hourMargin);
    }
/*
    function testWriteRemove_ListCorrect()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

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
