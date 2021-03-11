<?php

use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexOptionListModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\ProjectSettingsModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;
use Palaso\Utilities\FileUtilities;
use PHPUnit\Framework\TestCase;
use Api\Model\Shared\Rights\SystemRoles;

class ProjectCommandsTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    /** @var mixed[] Data storage between tests */
    private static $save;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
        self::$save = [];
    }

    public function testDeleteProjects_ProjectOwner_1Delete()
    {
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP,
            $user1->id->asString(), self::$environ->website);

        $this->assertEquals(1, ProjectCommands::deleteProjects(array($projectId), $user1Id));
    }

    public function testDeleteProjects_NotProjectOwner_Throw()
    {
        $this->expectException(UserUnauthorizedException::class);

        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = self::$environ->createUser("user2name", "User2 Name", "user2@example.com");
        $user1 = new UserModel($user1Id);
        $user2 = new UserModel($user2Id);

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP,
            $user1->id->asString(), self::$environ->website);
        $project = new ProjectModel($projectId);
        $project->addUser($user2->id->asString(), ProjectRoles::MANAGER);

        ProjectCommands::deleteProjects(array($projectId), $user2Id);
    }

    public function testArchiveProjects_PublishedProject_ProjectArchived()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $ownerId = $project->ownerRef->asString();

        $this->assertFalse($project->isArchived);

        ProjectCommands::archiveProject($projectId, $ownerId);

        $project = new ProjectModel($projectId);
        $this->assertTrue($project->isArchived);
    }

    public function testCheckIfArchivedAndThrow_NonArchivedProject_NoThrow()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        // Project not archived, no throw expected
        $this->assertNotFalse(ProjectCommands::checkIfArchivedAndThrow($project));
    }

    public function testCheckIfArchivedAndThrow_ArchivedProject_Throw()
    {
        $this->expectException(ResourceNotAvailableException::class);

        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->isArchived = true;
        $project->write();

        $this->assertTrue($project->isArchived);

        ProjectCommands::checkIfArchivedAndThrow($project);
    }

    public function testPublishProjects_ArchivedProject_ProjectPublished()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->isArchived = true;
        $projectId = $project->write();

        $this->assertTrue($project->isArchived);

        $count = ProjectCommands::publishProjects(array($projectId));

        $project = new ProjectModel($projectId);
        $this->assertEquals(1, $count);
        $this->assertFalse($project->isArchived);
    }

    public function testUpdateUserRole_UpdateUserInProject_UserJoinedProject()
    {
        self::$environ->clean();

        // setup parameters: user, project and params
        $userId = self::$environ->createUser("existinguser", "Existing Name", "existing@example.com");
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // update user role in project
        $updatedUserId = ProjectCommands::updateUserRole($projectId, $user->id->asString(), ProjectRoles::MANAGER);

        // read from disk
        $updatedUser = new UserModel($updatedUserId);
        $sameProject = new ProjectModel($projectId);

        // user updated and joined to project
        $this->assertEquals($userId, $updatedUser->id);
        $this->assertNotEquals(ProjectRoles::MANAGER, $updatedUser->role);
        $projectUser = $sameProject->listUsers()->entries[0];
        $this->assertEquals('Existing Name', $projectUser['name']);
        $userProject = $updatedUser->listProjects(self::$environ->website->domain)->entries[0];
        $this->assertEquals(SF_TESTPROJECT, $userProject['projectName']);
    }

    public function testUpdateUserRole_JoinTwice_JoinedOnce()
    {
        self::$environ->clean();

        // setup user and project
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $userId = self::$environ->createUser("existinguser", "Existing Name", "existing@example.com");

        // update user role in project once
        $updatedUserId = ProjectCommands::updateUserRole($projectId, $userId);

        // read from disk
        $sameUser = new UserModel($updatedUserId);
        $sameProject = new ProjectModel($projectId);

        // user in project once and project has one user
        $this->assertEquals(1, $sameProject->listUsers()->count);
        $this->assertEquals(1, $sameUser->listProjects(self::$environ->website->domain)->count);

        // update user role in project again
        $updatedUserId = ProjectCommands::updateUserRole($projectId, $userId);

        // read from disk again
        $sameProject = new ProjectModel($projectId);
        $sameUser = new UserModel($updatedUserId);

        // user still in project once and project still has one user
        $this->assertEquals(1, $sameProject->listUsers()->count);
        $this->assertEquals(1, $sameUser->listProjects(self::$environ->website->domain)->count);
    }

    public function testRemoveUsers_NoUsers_NoThrow()
    {
        self::$environ->clean();

        // setup parameters: project and users
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $userIds = array();

        // there are no users in project
        $this->assertEquals(0, $project->listUsers()->count);

        // remove users from project with no users - no throw expected
        ProjectCommands::removeUsers($projectId, $userIds);
    }

    public function testReadSettings_CanReadSettings()
    {
        self::$environ->clean();

        // setup project and users
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $projectSettings = new ProjectSettingsModel($projectId);
        $projectSettings->smsSettings->accountId = "12345";
        $projectSettings->write();

        $result = ProjectCommands::readProjectSettings($projectId);

        $this->assertEquals('12345', $result['sms']['accountId']);
    }

    public function testRemoveUsers_UsersInProject_RemovedFromProject()
    {
        self::$environ->clean();

        // setup project and users
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = self::$environ->createUser("user2name", "User2 Name", "user2@example.com");
        $user3Id = self::$environ->createUser("user3name", "User3 Name", "user3@example.com");
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

        // each user in project, project has each user
        $user1Project = $otherUser1->listProjects(self::$environ->website->domain)->entries[0];
        $this->assertEquals(SF_TESTPROJECT, $user1Project['projectName']);
        $user2Project = $otherUser1->listProjects(self::$environ->website->domain)->entries[0];
        $this->assertEquals(SF_TESTPROJECT, $user2Project['projectName']);
        $user3Project = $otherUser1->listProjects(self::$environ->website->domain)->entries[0];
        $this->assertEquals(SF_TESTPROJECT, $user3Project['projectName']);
        $projectUser1 = $otherProject->listUsers()->entries[0];
        $this->assertEquals('user1name', $projectUser1['username']);
        $projectUser2 = $otherProject->listUsers()->entries[1];
        $this->assertEquals('user2name', $projectUser2['username']);
        $projectUser3 = $otherProject->listUsers()->entries[2];
        $this->assertEquals('user3name', $projectUser3['username']);

        // remove users from project
        $userIds = array($user1->id->asString(), $user2->id->asString(), $user3->id->asString());
        ProjectCommands::removeUsers($projectId, $userIds);

        // read from disk
        $sameProject = new ProjectModel($projectId);
        $sameUser1 = new UserModel($user1Id);
        $sameUser2 = new UserModel($user2Id);
        $sameUser3 = new UserModel($user3Id);

        // project has no users, each user not in project
        $this->assertEquals(0, $sameProject->listUsers()->count);
        $this->assertEquals(0, $sameUser1->listProjects(self::$environ->website->domain)->count);
        $this->assertEquals(0, $sameUser2->listProjects(self::$environ->website->domain)->count);
        $this->assertEquals(0, $sameUser3->listProjects(self::$environ->website->domain)->count);
    }

    public function testRemoveUsers_ProjectOwner_NotRemovedFromProject_Exception()
    {
        $this->expectException(Exception::class);

        self::$environ->clean();

        // setup project and users.  user1 is the project owner
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = self::$environ->createUser("user2name", "User2 Name", "user2@example.com");
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
        self::$save['projectId'] = $projectId;
        self::$save['user1Id'] = $user1Id;
        self::$save['user2Id'] = $user2Id;

        // remove users from project.  user1 still remains as project owner
        $userIds = array($user1->id->asString(), $user2->id->asString());

        ProjectCommands::removeUsers($projectId, $userIds);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    /**
     * @depends testRemoveUsers_ProjectOwner_NotRemovedFromProject_Exception
     */
    public function testRemoveUsers_ProjectOwner_NotRemovedFromProject()
    {
        // read from disk
        $sameProject = new ProjectModel(self::$save['projectId']);
        $sameUser1 = new UserModel(self::$save['user1Id']);
        $sameUser2 = new UserModel(self::$save['user2Id']);

        // project still has project owner
        $this->assertEquals(1, $sameProject->listUsers()->count);
        $this->assertEquals(0, $sameUser1->listProjects(self::$environ->website->domain)->count);
        $this->assertEquals(1, $sameUser2->listProjects(self::$environ->website->domain)->count);
    }

    public function testProjectCodeExists_CodeExists_True()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->write();

        $this->assertTrue(ProjectCommands::projectCodeExists(SF_TESTPROJECTCODE));
    }

    public function testProjectCodeExists_CodeDoesNotExist_False()
    {
        self::$environ->clean();

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->write();

        $this->assertFalse(ProjectCommands::projectCodeExists('randomcode'));
    }

    public function testCreateProject_NewProject_ProjectOwnerSet()
    {
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, LexProjectModel::LEXICON_APP,
            $user1->id->asString(), self::$environ->website);

        $project = new ProjectModel($projectId);
        $this->assertTrue($project->ownerRef->asString() == $user1->id->asString());
    }

    public function testCreateProject_LexiconProject_IndexesCreated()
    {
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, LexProjectModel::LEXICON_APP,
            $user1->id->asString(), self::$environ->website);

        $project = new LexProjectModel($projectId);
        $collectionName = 'activity';
        $databaseName = $project->databaseName();
        $indexCount = iterator_count(MongoStore::getCollectionIndexes($databaseName, $collectionName));
        $this->assertTrue($indexCount >= 1);
        $index = ['key' => ['_id' => 1]];
        $this->assertTrue(MongoStore::isIndexFieldNameInCollection($index, $databaseName, $collectionName));
    }

    public function testMongoStoreIsIndexFieldNameInCollection_LexProject_Ok()
    {
        // setup
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);
        $srProject = null;
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE,
            LexProjectModel::LEXICON_APP, $user1->id->asString(), self::$environ->website, $srProject);
        $project = new LexProjectModel($projectId);
        $databaseName = $project->databaseName();
        $collectionName = LexEntryModel::mapper($databaseName)->getCollectionName();

        // is not in collection
        $index = ['key' => ['code' => 1]];
        $this->assertFalse(MongoStore::isIndexFieldNameInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('', $indexName);

        // is not in collection irrespective of field order
        $index = ['key' => ['code' => -1]];
        $this->assertFalse(MongoStore::isIndexFieldNameInCollection($index, $databaseName, $collectionName, $indexName));

        // is in collection
        $index = ['key' => ['guid' => 1]];
        $this->assertTrue(MongoStore::isIndexFieldNameInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('guid_1', $indexName);

        // is in collection irrespective of field order
        $index = ['key' => ['guid' => -1]];
        $this->assertTrue(MongoStore::isIndexFieldNameInCollection($index, $databaseName, $collectionName, $indexName));

        // is in collection if its not the first key in collection
        $index = ['key' => ['dirtySR' => 1]];
        $this->assertTrue(MongoStore::isIndexFieldNameInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('guid_1_dirtySR_1', $indexName);

        // is in collection if its not the first key in index
        $index = ['key' => ['code' => 1, 'dirtySR' => 1]];
        $this->assertTrue(MongoStore::isIndexFieldNameInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('guid_1_dirtySR_1', $indexName);
    }

    public function testMongoStoreIsAllIndexFieldNamesInCollection_LexProject_Ok()
    {
        // setup
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);
        $srProject = null;
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE,
            LexProjectModel::LEXICON_APP, $user1->id->asString(), self::$environ->website, $srProject);
        $project = new LexProjectModel($projectId);
        $databaseName = $project->databaseName();
        $collectionName = LexEntryModel::mapper($databaseName)->getCollectionName();

        // is not in collection
        $index = ['key' => ['code' => 1]];
        $this->assertFalse(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('', $indexName);

        // is not in collection irrespective of field order
        $index = ['key' => ['code' => -1]];
        $this->assertFalse(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));

        // is not in collection if only the second field name exists
        $index = ['key' => ['code' => 1, 'dirtySR' => 1]];
        $this->assertFalse(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('', $indexName);

        // is not in collection if only one field name matches
        $index = ['key' => ['dirtySR' => 1]];
        $this->assertFalse(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('', $indexName);

        // is in collection
        $index = ['key' => ['guid' => 1]];
        $this->assertTrue(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('guid_1', $indexName);

        // is in collection irrespective of field order
        $index = ['key' => ['guid' => -1]];
        $this->assertTrue(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));

        // is in collection if both match
        $index = ['key' => ['guid' => 1, 'dirtySR' => 1]];
        $this->assertTrue(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('guid_1_dirtySR_1', $indexName);

        // is in collection if both match irrespective of field name order
        $index = ['key' => ['dirtySR' => 1, 'guid' => 1]];
        $this->assertTrue(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName));
        $this->assertEquals('guid_1_dirtySR_1', $indexName);
    }

    public function testMongoStoreIsIndexIdenticalInCollection_LexProject_Ok()
    {
        // setup
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);
        $srProject = null;
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE,
            LexProjectModel::LEXICON_APP, $user1->id->asString(), self::$environ->website, $srProject);
        $project = new LexProjectModel($projectId);
        $databaseName = $project->databaseName();
        $collectionName = LexEntryModel::mapper($databaseName)->getCollectionName();

        // is not in collection
        $index = ['key' => ['code' => 1]];
        $this->assertFalse(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));

        // is not in collection irrespective of field order
        $index = ['key' => ['code' => -1]];
        $this->assertFalse(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));

        // is not in collection if field missing
        $index = ['key' => ['guid' => 1]];
        $this->assertFalse(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));

        // is not in collection irrespective of field order and if field missing
        $index = ['key' => ['guid' => -1]];
        $this->assertFalse(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));

        // is not in collection if with 2 field names and field missing
        $index = ['key' => ['guid' => 1, 'dirtySR' => 1]];
        $this->assertFalse(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));

        // is not in collection if field different
        $index = ['key' => ['guid' => 1], 'unique' => false];
        $this->assertFalse(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));

        // is in collection
        $index = ['key' => ['guid' => 1], 'unique' => true];
        $this->assertTrue(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));

        // is in collection if with 2 field names
        $index = ['key' => ['guid' => 1, 'dirtySR' => 1], 'unique' => true];
        $this->assertTrue(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName));
    }

    public function testMongoStoreEnsureIndexesInCollection_LexProject_Ok()
    {
        // setup
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);
        $srProject = null;
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE,
            LexProjectModel::LEXICON_APP, $user1->id->asString(), self::$environ->website, $srProject);
        $project = new LexProjectModel($projectId);
        $databaseName = $project->databaseName();
        $collectionName = LexEntryModel::mapper($databaseName)->getCollectionName();
        $indexes = LexEntryModel::mapper($databaseName)->INDEXES_REQUIRED;
        foreach ($indexes as $index) {
            $this->assertTrue(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName),
                'index not in lexicon: ' . var_export($index, true));
        }
        $additionalIndex = ['key' => ['test' => 1]];
        $indexes[] = $additionalIndex;
        $this->assertFalse(MongoStore::isAllIndexFieldNamesInCollection($additionalIndex, $databaseName, $collectionName));

        MongoStore::ensureIndexesInCollection($databaseName, $collectionName, $indexes);

        foreach ($indexes as $index) {
            $this->assertTrue(MongoStore::isIndexIdenticalInCollection($index, $databaseName, $collectionName),
                'index not in lexicon: ' . var_export($index, true));
        }
    }

    public function testCreateProject_LexProject_IndexesCreated()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);
        $srProject = null;

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE,
            LexProjectModel::LEXICON_APP, $user1->id->asString(), self::$environ->website, $srProject);

        $project = new LexProjectModel($projectId);
        $databaseName = $project->databaseName();
        $collectionName = LexEntryModel::mapper($databaseName)->getCollectionName();
        $indexCount = iterator_count(MongoStore::getCollectionIndexes($databaseName, $collectionName));
        $this->assertTrue($indexCount >= 3);
        $index = ['key' => ['guid' => 1]];
        $this->assertTrue(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName));
        $collectionName = LexOptionListModel::mapper($databaseName)->getCollectionName();
        $indexCount = iterator_count(MongoStore::getCollectionIndexes($databaseName, $collectionName));
        $this->assertTrue($indexCount >= 2);
        $index = ['key' => ['code' => 1]];
        $this->assertTrue(MongoStore::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName));
    }

    public function testCreateProject_NoSRProject_NotSRProjectWithNoLinks()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);
        $srProject = null;

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE,
            LexProjectModel::LEXICON_APP, $user1->id->asString(), self::$environ->website, $srProject);

        $project = new LexProjectModel($projectId);
        $assetImagePath = $project->getImageFolderPath();
        $assetAudioPath = $project->getAudioFolderPath();
        $this->assertFalse($project->hasSendReceive());
        $this->assertFalse(is_link($assetImagePath));
        $this->assertFalse(is_link($assetAudioPath));

        $projectWorkPath = $project->getSendReceiveWorkFolder();
        FileUtilities::removeFolderAndAllContents($project->getAssetsFolderPath());
        FileUtilities::removeFolderAndAllContents($projectWorkPath);
    }

    public function testCreateProject_NewSRProject_SRProjectWithLinks()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user1 = new UserModel($user1Id);
        $srProject = array(
            'identifier' => 'srIdentifier',
            'name' => 'srName',
            'repository' => 'https://public.languagedepot.org',
            'role' => 'manager'
        );

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE,
            LexProjectModel::LEXICON_APP, $user1->id->asString(), self::$environ->website, $srProject);

        $project = new LexProjectModel($projectId);
        $assetImagePath = $project->getImageFolderPath();
        $assetAudioPath = $project->getAudioFolderPath();
        $this->assertTrue($project->hasSendReceive());
        $this->assertTrue(is_link($assetImagePath));
        $this->assertTrue(is_link($assetAudioPath));

        $projectWorkPath = $project->getSendReceiveWorkFolder();
        FileUtilities::removeFolderAndAllContents($project->getAssetsFolderPath());
        FileUtilities::removeFolderAndAllContents($projectWorkPath);
    }

    public function testDeleteProjectSecondProject_multipleProjectsWithUserMembers_firstProjectShowsUserMembers() {
        self::$environ->clean();

        // create two users and two projects
        $user1Id = self::$environ->createUser("user1name", "User1 Name", "user1@example.com");
        $user2Id = self::$environ->createUser("user2name", "User2 Name", "user2@example.com");
        $user1 = new UserModel($user1Id);
        $user2 = new UserModel($user2Id);
        $project1Id = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP, $user1Id, self::$environ->website);
        $project2Id = ProjectCommands::createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2, SfProjectModel::SFCHECKS_APP, $user1Id, self::$environ->website);

        // user1 is already a manager of both projects
        // make user2 a manager of both projects as well
        ProjectCommands::updateUserRole($project1Id, $user2Id, ProjectRoles::MANAGER);
        ProjectCommands::updateUserRole($project2Id, $user2Id, ProjectRoles::MANAGER);

        // list members of project1 - there should be two members
        $usersDto = ProjectCommands::usersDto($project1Id);
        $this->assertEquals(2, $usersDto['userCount']);

        // list members of project2 - there should be two members
        $usersDto = ProjectCommands::usersDto($project2Id);
        $this->assertEquals(2, $usersDto['userCount']);

        // user1 deletes project1
        ProjectCommands::deleteProjects(array($project1Id), $user1Id);

        // list members of project2 - there should be two members
        $usersDto = ProjectCommands::usersDto($project2Id);
        $this->assertEquals(2, $usersDto['userCount']);
    }

    public function testUpdateUserRole_userIsAdminAndSetTechSupportRole_techSupportRoleSet()
    {
        self::$environ->clean();

        $adminId = self::$environ->createUser("adminname", "admin Name", "admin@example.com");
        $admin = new UserModel($adminId);
        $admin->role = SystemRoles::SYSTEM_ADMIN;
        $admin->write();

        $ownerId = self::$environ->createUser("ownername", "owner Name", "owner@example.com");

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP, $ownerId, self::$environ->website);
        ProjectCommands::updateUserRole($projectId, $adminId, ProjectRoles::TECH_SUPPORT);

        $project = ProjectModel::getById($projectId);
        $this->assertArrayHasKey($adminId, $project->users);
        $this->assertEquals($project->users[$adminId]->role, ProjectRoles::TECH_SUPPORT);
    }

    public function testUpdateUserRole_userIsNotAdminAndSetTechSupportRole_throwsException()
    {
        $this->expectException(UserUnauthorizedException::class);
        self::$environ->clean();

        $userId = self::$environ->createUser("username", "user Name", "user@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;
        $user->write();

        $ownerId = self::$environ->createUser("ownername", "owner Name", "owner@example.com");

        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP, $ownerId, self::$environ->website);
        ProjectCommands::updateUserRole($projectId, $userId, ProjectRoles::TECH_SUPPORT);
    }

    public function testProjectInviteLink_enableAndDisableInviteLink_successfulEnableAndDisable()
    {
        self::$environ->clean();
        $ownerId = self::$environ->createUser("ownername", "owner Name", "owner@example.com");
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP, $ownerId, self::$environ->website);
        $projectModel = ProjectModel::getById($projectId);
        $inviteUrl = ProjectCommands::createInviteLink($projectId, ProjectRoles::MANAGER);

        // Assert URL is valid to site
        $this->assertStringContainsString($projectModel->siteName, $inviteUrl);
        $this->assertStringContainsString('.org/invite/', $inviteUrl);

        // Assert invite token is found in the database
        $lastSlashPos = strrpos($inviteUrl, '/');
        $token = substr($inviteUrl, $lastSlashPos + 1);
        $this->assertTrue($projectModel->readByProperties(['inviteToken.token' => $token, 'inviteToken.defaultRole' => ProjectRoles::MANAGER]));

        // Disable invite link and make sure it no longer exists in the DB
        ProjectCommands::disableInviteToken($projectId);
        $this->assertFalse($projectModel->readByProperty('inviteToken.token', $token));
    }

    public function testProjectInviteLink_changeInviteLinkDefaultRole_roleChangeSuccessful()
    {
        self::$environ->clean();
        $ownerId = self::$environ->createUser("ownername", "owner Name", "owner@example.com");
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP, $ownerId, self::$environ->website);
        $projectModel = ProjectModel::getById($projectId);
        $inviteUrl = ProjectCommands::createInviteLink($projectId, ProjectRoles::MANAGER);

        // Assert defaultRole is set to initialized role
        $lastSlashPos = strrpos($inviteUrl, '/');
        $token = substr($inviteUrl, $lastSlashPos + 1);
        $this->assertTrue($projectModel->readByProperties(['inviteToken.token' => $token, 'inviteToken.defaultRole' => ProjectRoles::MANAGER]));

        // Change defaultRole
        ProjectCommands::updateInviteTokenRole($projectId, ProjectRoles::CONTRIBUTOR);
        $this->assertTrue($projectModel->readByProperties(['inviteToken.token' => $token, 'inviteToken.defaultRole' => ProjectRoles::CONTRIBUTOR]));
    }

    public function testProjectInviteLink_addMemberFromLink_additionSuccessful()
    {
        self::$environ->clean();
        $ownerId = self::$environ->createUser("ownername", "owner Name", "owner@example.com");
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP, $ownerId, self::$environ->website);
        $projectModel = ProjectModel::getById($projectId);
        $inviteUrl = ProjectCommands::createInviteLink($projectId, ProjectRoles::MANAGER);

        $userId = self::$environ->createUser("user name", "user Name", "user@example.com");
        ProjectCommands::useInviteToken($userId, $projectId);

        $projectModel = ProjectModel::getById($projectId);
        $this->assertArrayHasKey($userId, $projectModel->users);
        $this->assertEquals($projectModel->users[$userId]->role, ProjectRoles::MANAGER);
    }

    public function testProjectInviteLink_addExistingMemberFromLink_additionFails()
    {
        self::$environ->clean();
        $ownerId = self::$environ->createUser("ownername", "owner Name", "owner@example.com");
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, SfProjectModel::SFCHECKS_APP, $ownerId, self::$environ->website);
        $projectModel = ProjectModel::getById($projectId);
        $inviteUrl = ProjectCommands::createInviteLink($projectId, ProjectRoles::CONTRIBUTOR);

        ProjectCommands::useInviteToken($ownerId, $projectId);

        $projectModel = ProjectModel::getById($projectId);
        $this->assertNotEquals($projectModel->users[$ownerId]->role, ProjectRoles::CONTRIBUTOR);
    }
}
