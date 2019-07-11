<?php

use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserListModel;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class MultipleModelTest extends TestCase
{
    public function testWrite_TwoModels_ReadBackBothModelsOk()
    {
        $model = new UserModel();
        $model->email = 'user@example.com';
        $model->username = 'SomeUser';
        $id = $model->write();
        $this->assertNotNull($id);
        $this->assertIsString($id);
        $otherModel = new UserModel($id);
        $this->assertEquals($id, $otherModel->id->asString());
        $this->assertEquals('user@example.com', $otherModel->email);
        $this->assertEquals('SomeUser', $otherModel->username);

        $model = new ProjectModel();
        $model->language = 'SomeLanguage';
        $model->projectName = 'SomeProject';
        $id = $model->write();
        $this->assertNotNull($id);
        $this->assertIsString($id);
        $otherModel = new ProjectModel($id);
        $this->assertEquals($id, $otherModel->id->asString());
        $this->assertEquals('SomeLanguage', $otherModel->language);
        $this->assertEquals('SomeProject', $otherModel->projectName);
    }

    public function testUserList_HadOnlyUsers()
    {
        $userList = new UserListModel();
        $userList->read();

        foreach ($userList->entries as $entry) {
            $this->assertArrayHasKey('username', $entry, "Key 'username' not found " . print_r($entry, true));
        }
    }

    public function testProjectList_HadOnlyProjects()
    {
        $projectList = new ProjectListModel();
        $projectList->read();

        foreach ($projectList->entries as $entry) {
            $this->assertArrayHasKey('projectName', $entry);
        }
    }
}
