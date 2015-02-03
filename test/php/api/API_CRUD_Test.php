<?php

use models\scriptureforge\sfchecks\commands\SfchecksProjectCommands;

use libraries\shared\Website;

use models\mapper\Id;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;
use models\commands\UserCommands;
use models\commands\QuestionTemplateCommands;
use models\commands\QuestionCommands;
use models\commands\TextCommands;
use models\commands\ProjectCommands;
use models\scriptureforge\dto\ProjectPageDto;
use models\scriptureforge\dto\QuestionListDto;
use models\UserModel;
use models\ProjectModel;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

require_once TestPath . 'common/MongoTestEnvironment.php';

class ApiCrudTestEnvironment
{
    public $e;

    public function __construct()
    {
        $this->e = new MongoTestEnvironment();
        $this->e->clean();
    }

    public function makeProject($userId = '')
    {
        if (!$userId) {
            $userId = $this->makeSystemAdminUser();
        }

        return ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $userId, $this->e->website);
    }

    public function makeUser($username)
    {
        $params = array('id' => '', 'username' => $username, 'name' => $username, 'email' => 'user@example.com');;

        return UserCommands::updateUser($params);
    }

    public function makeSystemAdminUser()
    {
        $params = array('id' => '', 'username' => 'admin', 'name' => 'admin', 'email' => 'admin@example.com', 'role' => SystemRoles::SYSTEM_ADMIN);

        return UserCommands::updateUser($params);
    }

    public function makeText($projectId, $textName)
    {
        $model = array('id' => '', 'title' => $textName);

        return TextCommands::updateText($projectId, $model);
    }

    public function makeQuestion($projectId)
    {
        $model = array('id' => '');

        return QuestionCommands::updateQuestion($projectId, $model);
    }

    public function json($input)
    {
        return $this->e->fixJson($input);
    }

    public function getProjectMember($projectId, $userName)
    {
        $userId = $this->e->createUser($userName, $userName, 'user@example.com');
        $user = new UserModel($userId);
        $user->addProject($projectId);
        $user->write();
        $project = new ProjectModel($projectId);
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        return $userId;
    }

}

class TestApiCrud extends UnitTestCase
{
    public function testProjectCRUD_CRUDOK()
    {
        $e = new ApiCrudTestEnvironment();

        $userId = $e->e->createUser('userName', 'User Name', 'user@example.com', SystemRoles::SYSTEM_ADMIN);
        $id = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $userId, $e->e->website);
        $this->assertNotNull($id);
        $this->assertEqual(24, strlen($id));

        // Read
        $result = ProjectCommands::readProject($id);
        $this->assertNotNull($result['id']);
        $this->assertEqual(SF_TESTPROJECT, $result['projectName']);

        // Update
        $result['language'] = 'AnotherLanguage';
        $id = SfchecksProjectCommands::updateProject($id, $userId, $e->json($result));
        $this->assertNotNull($id);
        $this->assertEqual($result['id'], $id);

        // Delete
        $result = ProjectCommands::deleteProjects(array($id));
        $this->assertTrue($result);
    }

    public function testQuestionCRUD_CRUDOK()
    {
        $e = new ApiCrudTestEnvironment();

        // create project
        $projectId = $e->makeProject();

        // create an user and add to the project
        $userId = $e->getProjectMember($projectId, 'user1');

        // create text
        $textId = $e->makeText($projectId, "test text 1");

        // List
        $dto = $e->json(QuestionListDto::encode($projectId, $textId, $userId));
        $this->assertEqual($dto['count'], 0);

        // Create
        $model = array(
            'id' => '',
            'title' =>'SomeQuestion',
            'description' =>'SomeDescription',
            'textRef' => $textId
        );
        $questionId = QuestionCommands::updateQuestion($projectId, $model);
        $this->assertNotNull($questionId);
        $this->assertEqual(24, strlen($questionId));

        // Read
        $result = $e->json(QuestionCommands::readQuestion($projectId, $questionId));
        $this->assertNotNull($result['id']);
        $this->assertEqual('SomeQuestion', $result['title']);

        // Update
        $result['title'] = 'OtherQuestion';
        $id = QuestionCommands::updateQuestion($projectId, $result);
        $this->assertNotNull($id);
        $this->assertEqual($result['id'], $id);

        // Read back
        $result = $e->json(QuestionCommands::readQuestion($projectId, $questionId));
        $this->assertEqual('OtherQuestion', $result['title']);

        // List
        $dto = $e->json(QuestionListDto::encode($projectId, $textId, $userId));
        $this->assertEqual(1, $dto['count']);

        // Delete
        $result = QuestionCommands::deleteQuestions($projectId, array($questionId));
        $this->assertTrue($result);

        // List to confirm delete
        $dto = $e->json(QuestionListDto::encode($projectId, $textId, $userId));
        $this->assertEqual(0, $dto['count']);

        // Clean up after ourselves
        ProjectCommands::deleteProjects(array($projectId));
    }

    public function testQuestionTemplateCRUD_CRUDOK()
    {
        $e = new ApiCrudTestEnvironment();
        $projectId = $e->makeProject();

        // Initial List
        $result = $e->json(QuestionTemplateCommands::listTemplates($projectId));
        $existingCount = $result['count'];

        // Create
        $model = array('id'=>'','title'=>'Template Title', 'description' => 'Nice and clear description');
        $id = QuestionTemplateCommands::updateTemplate($projectId, $model);
        $this->assertNotNull($id);
        $this->assertEqual(24, strlen($id));

        // Create Second
        $model = array('id'=>'','title'=>'Template Title 2', 'description' => 'Nice and clear description 2');
        $id2 = QuestionTemplateCommands::updateTemplate($projectId, $model);

        // List
        $result = $e->json(QuestionTemplateCommands::listTemplates($projectId));
        $this->assertEqual($result['count'], $existingCount + 2);

        // Read
        $result = $e->json(QuestionTemplateCommands::readTemplate($projectId, $id));
        $this->assertNotNull($result['id']);
        $this->assertEqual('Template Title', $result['title']);
        $this->assertEqual('Nice and clear description', $result['description']);

        // Update
        $result['description'] = 'Muddled description';
        $newid = QuestionTemplateCommands::updateTemplate($projectId, $result);
        $this->assertNotNull($newid);
        $this->assertEqual($id, $newid);

        // Verify update actually changed DB
        $postUpdateResult = $e->json(QuestionTemplateCommands::readTemplate($projectId, $id));
        $this->assertNotNull($postUpdateResult['id']);
        $this->assertEqual($postUpdateResult['description'], 'Muddled description');

        // Delete
        $result = QuestionTemplateCommands::deleteQuestionTemplates($projectId, array($id));
        $this->assertTrue($result);
        QuestionTemplateCommands::deleteQuestionTemplates($projectId, array($id2));
    }

    public function testTextCRUD_CRUDOK()
    {
        $e = new ApiCrudTestEnvironment();
        $projectId = $e->makeProject();

        $userId = $e->getProjectMember($projectId, 'user1');

        // Initial List
        $result = $e->json(ProjectPageDto::encode($projectId, $userId));
        $count = count($result['texts']);

        // Create
        $model = array(
            'id' => '',
            'title' =>'SomeText'
        );
        $id = TextCommands::updateText($projectId, $model);
        $this->assertNotNull($id);
        $this->assertEqual(24, strlen($id));

        // Read
        $result = $e->json(TextCommands::readText($projectId, $id));
        $this->assertNotNull($result['id']);
        $this->assertEqual('SomeText', $result['title']);

        // Update
        $result['title'] = 'OtherText';
        $id = TextCommands::updateText($projectId, $result);
        $this->assertNotNull($id);
        $this->assertEqual($result['id'], $id);

        // Read back
        $result = $e->json(TextCommands::readText($projectId, $id));
        $this->assertEqual('OtherText', $result['title']);

        // List
        $result = $e->json(ProjectPageDto::encode($projectId, $userId));
        $this->assertEqual($count + 1, count($result['texts']));

        // Delete
        $result = TextCommands::deleteTexts($projectId, array($id));
        $this->assertTrue($result);

        // List to confirm delete
        $result = $e->json(ProjectPageDto::encode($projectId, $userId));
        $this->assertEqual($count, count($result['texts']));

        // Clean up after ourselves
        ProjectCommands::deleteProjects(array($projectId));
    }

    public function testUserCRUD_CRUDOK()
    {
        $e = new ApiCrudTestEnvironment();

        // initial list
        $result = $e->json(UserCommands::listUsers());
        $count = $result['count'];

        // Create
        $userId = $e->e->createUser('someuser', 'SomeUser','some@example.com');
        $someUser = new UserModel($userId);
        $this->assertNotNull($someUser);
        $this->assertEqual(24, strlen($someUser->id->asString()));
        // create project
        $projectId = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $someUser->id->asString(), $e->e->website);

        // list
        $result = $e->json(UserCommands::listUsers());
        $this->assertEqual($count + 1, $result['count']);

        // Read
        $result = $e->json(UserCommands::readUser($someUser->id->asString()));
        $this->assertNotNull($result['id']);
        $this->assertEqual('someuser', $result['username']);
        $this->assertEqual('some@example.com', $result['email']);

        // Update
        $result['username'] = 'other';
        $result['email'] = 'other@example.com';
        $id = UserCommands::updateUser($result);
        $this->assertNotNull($id);
        $this->assertEqual($result['id'], $id);

        // typeahead
        $result = $e->json(UserCommands::userTypeaheadList('ome', '', $e->e->website));
        $this->assertTrue($result['count'] > 0);

        // change password
        UserCommands::changePassword($id, 'newpassword', $id);

        // Delete
        $result = UserCommands::deleteUsers(array($id));
        $this->assertTrue($result);
    }
}
