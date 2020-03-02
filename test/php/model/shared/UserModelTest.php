<?php

use Api\Library\Shared\Website;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
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
        $this->assertIsString($id);
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
        $website = new Website('languageforge.localhost', Website::LANGUAGEFORGE);
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

    public function testUserExists_usernameFound_UserExists()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $environ->createUser('jsmith', 'joe smith', 'joe@smith.com');

        $user = new UserModel();
        $this->assertTrue($user->userExists('jsmith'));
    }

    public function testUserExists_emailFound_UserExists()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $environ->createUser('jsmith', 'joe smith', 'joe@smith.com');

        $user = new UserModel();
        $this->assertTrue($user->userExists('joe@smith.com'));
    }

    public function testUserExists_emailUsernameNotFound_UserNoExists()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $environ->createUser('jsmith', 'joe smith', 'joe@smith.com');

        $user = new UserModel();
        $this->assertFalse($user->userExists('anotheruser'));
        $this->assertFalse($user->userExists('another@example.com'));
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

    public function testUserSetProperties_PublicAccessible_NamesAndEmailSet_RoleNotSet()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1@example.com');
        $user = new UserModel($userId);
        $params =
            ['username' => 'user2',
             'name' => 'User 2',
             'email' => 'user2@example.com',
             'role' => SystemRoles::SYSTEM_ADMIN
            ];
        $this->assertNotEquals($params['username'], $user->username);
        $this->assertNotEquals($params['name'], $user->name);
        $this->assertNotEquals($params['email'], $user->email);
        $this->assertEquals(SystemRoles::USER, $user->role);

        $user->setProperties(UserModel::PUBLIC_ACCESSIBLE, $params);
        $user->write();

        $this->assertEquals($params['username'], $user->username);
        $this->assertEquals($params['name'], $user->name);
        $this->assertEquals($params['email'], $user->email);
        $this->assertNotEquals($params['role'], $user->role);
    }

    public function testUserSetProperties_UserProfileAccessible_ProfileSet_Role_NotSet()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1@example.com');
        $user = new UserModel($userId);
        $params =
            ['avatar_color' => 'pink',
             'avatar_shape' => 'bat',
             'avatar_ref' => 'Site/views/shared/image/avatar/pinkbat.png',
             'mobile_phone' => '555-5555',
             'communicate_via' => UserModel::COMMUNICATE_VIA_BOTH,
             'name' => 'User 2',
             'age' => '21',
             'gender' => UserModel::GENDER_MALE,
             'interfaceLanguageCode' => 'th',
             'role' => SystemRoles::SYSTEM_ADMIN
            ];
        $this->assertNotEquals($params['avatar_color'], $user->avatar_color);
        $this->assertNotEquals($params['avatar_shape'], $user->avatar_shape);
        $this->assertNotEquals($params['avatar_ref'], $user->avatar_ref);
        $this->assertNotEquals($params['mobile_phone'], $user->mobile_phone);
        $this->assertNotEquals($params['communicate_via'], $user->communicate_via);
        $this->assertNotEquals($params['name'], $user->name);
        $this->assertNotEquals($params['age'], $user->age);
        $this->assertNotEquals($params['gender'], $user->gender);
        $this->assertNotEquals($params['interfaceLanguageCode'], $user->interfaceLanguageCode);
        $this->assertEquals(SystemRoles::USER, $user->role);

        $user->setProperties(UserModel::USER_PROFILE_ACCESSIBLE, $params);
        $user->write();

        $this->assertEquals($params['avatar_color'], $user->avatar_color);
        $this->assertEquals($params['avatar_shape'], $user->avatar_shape);
        $this->assertEquals($params['avatar_ref'], $user->avatar_ref);
        $this->assertEquals($params['mobile_phone'], $user->mobile_phone);
        $this->assertEquals($params['communicate_via'], $user->communicate_via);
        $this->assertEquals($params['name'], $user->name);
        $this->assertEquals($params['age'], $user->age);
        $this->assertEquals($params['gender'], $user->gender);
        $this->assertEquals($params['interfaceLanguageCode'], $user->interfaceLanguageCode);
        $this->assertNotEquals($params['role'], $user->role);
    }

    public function testUserSetProperties_AdminAccessible_AllPropertiesSet()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1@example.com');
        $user = new UserModel($userId);
        $params =
            ['username' => 'user2',
             'name' => 'User 2',
             'email' => 'user2@example.com',
             'role' => SystemRoles::SYSTEM_ADMIN,
             'active' => false,
             'avatar_color' => 'pink',
             'avatar_shape' => 'bat',
             'avatar_ref' => 'Site/views/shared/image/avatar/pinkbat.png',
             'mobile_phone' => '555-5555',
             'communicate_via' => UserModel::COMMUNICATE_VIA_BOTH,
             'age' => '21',
             'gender' => UserModel::GENDER_MALE,
             'interfaceLanguageCode' => 'th'
            ];
        $this->assertNotEquals($params['username'], $user->username);
        $this->assertNotEquals($params['name'], $user->name);
        $this->assertNotEquals($params['email'], $user->email);
        $this->assertNotEquals($params['role'], $user->role);
        $this->assertNotEquals($params['active'], $user->active);
        $this->assertNotEquals($params['avatar_color'], $user->avatar_color);
        $this->assertNotEquals($params['avatar_shape'], $user->avatar_shape);
        $this->assertNotEquals($params['avatar_ref'], $user->avatar_ref);
        $this->assertNotEquals($params['mobile_phone'], $user->mobile_phone);
        $this->assertNotEquals($params['communicate_via'], $user->communicate_via);
        $this->assertNotEquals($params['age'], $user->age);
        $this->assertNotEquals($params['gender'], $user->gender);
        $this->assertNotEquals($params['interfaceLanguageCode'], $user->interfaceLanguageCode);

        $user->setProperties(UserModel::ADMIN_ACCESSIBLE, $params);
        $user->write();

        $this->assertEquals($params['username'], $user->username);
        $this->assertEquals($params['name'], $user->name);
        $this->assertEquals($params['email'], $user->email);
        $this->assertEquals($params['role'], $user->role);
        $this->assertEquals($params['active'], $user->active);
        $this->assertEquals($params['avatar_color'], $user->avatar_color);
        $this->assertEquals($params['avatar_shape'], $user->avatar_shape);
        $this->assertEquals($params['avatar_ref'], $user->avatar_ref);
        $this->assertEquals($params['mobile_phone'], $user->mobile_phone);
        $this->assertEquals($params['communicate_via'], $user->communicate_via);
        $this->assertEquals($params['age'], $user->age);
        $this->assertEquals($params['gender'], $user->gender);
        $this->assertEquals($params['interfaceLanguageCode'], $user->interfaceLanguageCode);
    }

    public function testUserRemove_UserMemberOfProject_ProjectLinkRemovedAsWell()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'user1', 'user1@example.com');
        $user = new UserModel($userId);
        $project = $environ->createProject('testProject', 'testProjectCode');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();
        $user->addProject($project->id->asString());
        $user->write();

        // delete the user
        $user->remove();

        // re-read the project
        $projectId = $project->id->asString();
        $project = new \Api\Model\Shared\ProjectModel($projectId);

        $this->assertFalse($project->userIsMember($userId));

    }

    public function testHasForgottenPassword_KeyNotSetNoKeyConsume_HasNotForgotten()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1@example.com');
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
        $userId = $environ->createUser('user1', 'User1', 'user1@example.com');
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
        $this->assertEqualsWithDelta($user->resetPasswordExpirationDate->getTimestamp(), $future->getTimestamp(), $hourMargin, '');
    }

    public function testHasForgottenPassword_KeySetConsumeKey_HasForgottenKeyConsumed()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1@example.com');
        $user = new UserModel($userId);
        $user->setForgotPassword(7);
        $user->write();

        $hasForgottenPassword = $user->hasForgottenPassword(true);

        $this->assertTrue($hasForgottenPassword);
        $this->assertEmpty($user->resetPasswordKey);
        $today = new \DateTime();
        $hourMargin = 60;
        $this->assertEqualsWithDelta($user->resetPasswordExpirationDate->getTimestamp(), $today->getTimestamp(), $hourMargin, '');
    }

    public function testSetUniqueUsernameFromString_ExistingUsernameSelf_SetsUniqueUsername() {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('user1', 'User1', 'user1@example.com');
        $user = new UserModel($userId);
        $user->setUniqueUsernameFromString('User1');
        $this->assertEquals($user->username, 'user');
    }

    public function testSetUniqueUsernameFromString_3ExistingUsernames_SetsUniqueUsername() {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $environ->createUser('user', 'User1', 'user1@example.com');
        $environ->createUser('user1', 'User1', 'user1@example.com');
        $environ->createUser('user2', 'User2', 'user1@example.com');
        $environ->createUser('user3', 'User3', 'user1@example.com');

        $user = new UserModel();
        $user->setUniqueUsernameFromString('USER');
        $this->assertEquals($user->username, 'user4');
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
