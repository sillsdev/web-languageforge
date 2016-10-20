<?php

use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserListModel;
use Api\Model\Shared\UserModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestMultipleModel extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        parent::__construct();
    }

    public function testWrite_TwoModels_ReadBackBothModelsOk()
    {
        $model = new UserModel();
        $model->email = "user@example.com";
        $model->username = "SomeUser";
        $id = $model->write();
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $otherModel = new UserModel($id);
        $this->assertEqual($id, $otherModel->id->asString());
        $this->assertEqual('user@example.com', $otherModel->email);
        $this->assertEqual('SomeUser', $otherModel->username);

        $model = new ProjectModel();
        $model->language = "SomeLanguage";
        $model->projectName = "SomeProject";
        $id = $model->write();
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $otherModel = new ProjectModel($id);
        $this->assertEqual($id, $otherModel->id->asString());
        $this->assertEqual('SomeLanguage', $otherModel->language);
        $this->assertEqual('SomeProject', $otherModel->projectName);
    }

    public function testUserList_HadOnlyUsers()
    {
        $model = new UserListModel();
        $model->read();

        foreach ($model->entries as $entry) {
            $this->assertTrue(array_key_exists("username", $entry), "Key 'username' not found " . print_r($entry, true));
        }
    }

    public function testProjectList_HadOnlyProjects()
    {
        $model = new ProjectListModel();
        $model->read();

        foreach ($model->entries as $entry) {
            $this->assertTrue(array_key_exists("projectName", $entry));
        }
    }
}
