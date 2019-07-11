<?php

use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\ProjectRoles;
use PHPUnit\Framework\TestCase;

class SfchecksProjectModelTest extends TestCase
{
    public function testGetRightsArray_Ok()
    {
        $userId = MongoTestEnvironment::mockId();
        $project = new SfchecksProjectModel();
        $project->addUser($userId, ProjectRoles::MANAGER);
        $result = $project->getRightsArray($userId);
        $this->assertIsArray($result);
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
