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
}