<?php

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

require_once TestPhpPath . 'common/MongoTestEnvironment.php';

require_once SourcePath . "Api/Model/ProjectModel.php";
require_once SourcePath . "Api/Model/UserModel.php";

use Api\Model\UserModel;
use Api\Model\ProjectModel;

class TestMultipleModel extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
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
        $model = new Api\Model\UserListModel();
        $model->read();

        foreach ($model->entries as $entry) {
            $this->assertTrue(array_key_exists("username", $entry), "Key 'username' not found " . print_r($entry, true));
        }
    }

    public function testProjectList_HadOnlyProjects()
    {
        $model = new Api\Model\ProjectListModel();
        $model->read();

        foreach ($model->entries as $entry) {
            $this->assertTrue(array_key_exists("projectName", $entry));
        }
    }
}
