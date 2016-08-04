<?php
use Api\Model\Scriptureforge\SfchecksProjectModel;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\ProjectRoles;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestSfProjectModel extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
    }

    public function testGetRightsArray_Ok()
    {
        $userId = MongoTestEnvironment::mockId();
        $project = new SfchecksProjectModel();
        $project->addUser($userId, ProjectRoles::MANAGER);
        $result = $project->getRightsArray($userId);
        $this->assertIsA($result, 'array');
        $this->assertTrue(in_array(Domain::QUESTIONS + Operation::CREATE, $result));
    }

    public function testHasRight_Ok()
    {
        $userId = MongoTestEnvironment::mockId();
        $project = new SfchecksProjectModel();
        $project->addUser($userId, ProjectRoles::MANAGER);
        $result = $project->hasRight($userId, Domain::QUESTIONS + Operation::CREATE);
        $this->assertTrue($result);
    }

    public function testHasRight_OwnerHasArchiveOwn()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // Setup users and project
        $user1Id = $e->createUser('jsmith', 'joe manager', 'joe@manager.com');
        $user2Id = $e->createUser('jsmith2', 'joe 2 manager', 'joe2@manager.com');
        $user3Id = $e->createUser('user3', 'joe 3 user', 'joe3@user.com');
        $projectModel = new SfchecksProjectModel();

        // create the references
        $projectModel->addUser($user1Id, ProjectRoles::MANAGER);
        $projectModel->ownerRef->id = $user1Id;
        $projectModel->addUser($user2Id, ProjectRoles::MANAGER);
        $projectModel->addUser($user3Id, ProjectRoles::CONTRIBUTOR);
        $projectModel->write();

        $result1 = $projectModel->hasRight($user1Id, Domain::PROJECTS + Operation::ARCHIVE_OWN);
        $this->assertTrue($result1);
        $result2 = $projectModel->hasRight($user2Id, Domain::PROJECTS + Operation::ARCHIVE_OWN);
        $this->assertFalse($result2);
        $result3 = $projectModel->hasRight($user3Id, Domain::PROJECTS + Operation::ARCHIVE_OWN);
        $this->assertFalse($result3);    }
}