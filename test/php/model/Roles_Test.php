<?php


use Api\Model\Scriptureforge\Sfchecks\SfchecksRoles;

use Api\Model\Shared\Rights\Operation;

use Api\Model\Shared\Rights\Domain;

use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestRoles extends UnitTestCase
{
    public function testHasRight_SfchecksProject_Ok()
    {
        // User Roles
        $result = SfchecksRoles::hasRight(ProjectRoles::CONTRIBUTOR, Domain::ANSWERS + Operation::CREATE);
        $this->assertTrue($result);
        $result = SfchecksRoles::hasRight(ProjectRoles::CONTRIBUTOR, Domain::USERS + Operation::CREATE);
        $this->assertFalse($result);
        // Project Admin Roles
        $result = SfchecksRoles::hasRight(ProjectRoles::MANAGER, Domain::QUESTIONS + Operation::CREATE);
        $this->assertTrue($result);
        $result = SfchecksRoles::hasRight(ProjectRoles::MANAGER, Domain::PROJECTS + Operation::CREATE);
        $this->assertFalse($result);
        // System Admin Roles
        $result = SystemRoles::hasRight(SystemRoles::SYSTEM_ADMIN, Domain::USERS + Operation::CREATE);
        $this->assertTrue($result);
    }

    public function testGetRights_Ok()
    {
        $result = SfchecksRoles::getRightsArray(ProjectRoles::CONTRIBUTOR);
        $this->assertIsA($result, 'array');
    }

}
