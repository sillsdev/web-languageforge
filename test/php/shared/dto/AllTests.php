<?php

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllSharedDtoTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'shared/dto/ManageUsersDto_Test.php');
        $this->addFile(TestPath . 'shared/dto/ProjectListDto_Test.php');
        $this->addFile(TestPath . 'shared/dto/RightsHelper_Test.php');
        $this->addFile(TestPath . 'shared/dto/UserProfileDto_Test.php');
        $this->addFile(TestPath . 'shared/dto/ProjectManagementDto_Test.php');
    }

}
