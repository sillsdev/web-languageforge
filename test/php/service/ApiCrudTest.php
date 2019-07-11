<?php

use Api\Model\Scriptureforge\Sfchecks\Command\QuestionCommands;
use Api\Model\Scriptureforge\Sfchecks\Command\QuestionTemplateCommands;
use Api\Model\Scriptureforge\Sfchecks\Command\SfchecksProjectCommands;
use Api\Model\Scriptureforge\Sfchecks\Command\TextCommands;
use Api\Model\Scriptureforge\Sfchecks\Dto\ProjectPageDto;
use Api\Model\Scriptureforge\Sfchecks\Dto\QuestionListDto;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ApiCrudTestEnvironment extends MongoTestEnvironment
{
    public function makeProject($userId = '')
    {
        if (!$userId) {
            $userId = $this->makeSystemAdminUser();
        }

        return ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $userId, $this->website);
    }

    public function makeUser($username)
    {
        $params = array('id' => '', 'username' => $username, 'name' => $username, 'email' => 'user@example.com');;

        return UserCommands::updateUser($params, $this->website);
    }

    public function makeSystemAdminUser()
    {
        $params = array('id' => '', 'username' => 'admin', 'name' => 'admin', 'email' => 'admin@example.com',
            'role' => SystemRoles::SYSTEM_ADMIN);

        return UserCommands::updateUser($params, $this->website);
    }

    public function makeText($projectId, $textName, $userId)
    {
        $model = array('id' => '', 'title' => $textName);

        return TextCommands::updateText($projectId, $model, $userId);
    }

    public function makeQuestion($projectId, $userId)
    {
        $model = array('id' => '');

        return QuestionCommands::updateQuestion($projectId, $model, $userId);
    }

    public function getProjectMember($projectId, $userName)
    {
        $userId = $this->createUser($userName, $userName, 'user@example.com');
        $user = new UserModel($userId);
        $user->addProject($projectId);
        $user->write();
        $project = new ProjectModel($projectId);
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        return $userId;
    }
}

class ApiCrudTest extends TestCase
{
    /** @var ApiCrudTestEnvironment */
    public static $environ;

    public function setUp(): void
    {
        self::$environ = new ApiCrudTestEnvironment();
        self::$environ->clean();
    }

    public function testProjectCRUD_CRUDOK()
    {
        $userId = self::$environ->createUser('userName', 'User Name', 'user@example.com', SystemRoles::SYSTEM_ADMIN);
        $id = ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $userId, self::$environ->website);
        $this->assertNotNull($id);
        $this->assertEquals (24, strlen($id));

        // Read
        $result = ProjectCommands::readProject($id);
        $this->assertNotNull($result['id']);
        $this->assertEquals(SF_TESTPROJECT, $result['projectName']);

        // Update
        $result['language'] = 'AnotherLanguage';
        $id = SfchecksProjectCommands::updateProject($id, $userId, self::$environ->fixJson($result));
        $this->assertNotNull($id);
        $this->assertEquals($result['id'], $id);

        // Delete
        $result = ProjectCommands::deleteProjects(array($id), $userId);
        $this->assertTrue($result > 0);
    }

    public function testQuestionCRUD_CRUDOK()
    {
        // create project
        $projectId = self::$environ->makeProject();
        $project = new ProjectModel($projectId);

        // create an user and add to the project
        $userId = self::$environ->getProjectMember($projectId, 'user1');

        // create text
        $textId = self::$environ->makeText($projectId, "test text 1", $userId);

        // List
        $dto = self::$environ->fixJson(QuestionListDto::encode($projectId, $textId, $userId));
        $this->assertEquals(0, $dto['count']);

        // Create
        $model = array(
            'id' => '',
            'title' =>'SomeQuestion',
            'description' =>'SomeDescription',
            'textRef' => $textId
        );
        $questionId = QuestionCommands::updateQuestion($projectId, $model, $userId);
        $this->assertNotNull($questionId);
        $this->assertEquals(24, strlen($questionId));

        // Read
        $result = self::$environ->fixJson(QuestionCommands::readQuestion($projectId, $questionId));
        $this->assertNotNull($result['id']);
        $this->assertEquals('SomeQuestion', $result['title']);

        // Update
        $result['title'] = 'OtherQuestion';
        $id = QuestionCommands::updateQuestion($projectId, $result, $userId);
        $this->assertNotNull($id);
        $this->assertEquals($result['id'], $id);

        // Read back
        $result = self::$environ->fixJson(QuestionCommands::readQuestion($projectId, $questionId));
        $this->assertEquals('OtherQuestion', $result['title']);

        // List
        $dto = self::$environ->fixJson(QuestionListDto::encode($projectId, $textId, $userId));
        $this->assertEquals(1, $dto['count']);

        // Delete
        $result = QuestionCommands::deleteQuestions($projectId, array($questionId));
        $this->assertTrue($result > 0);

        // List to confirm delete
        $dto = self::$environ->fixJson(QuestionListDto::encode($projectId, $textId, $userId));
        $this->assertEquals(0, $dto['count']);

        // Clean up after ourselves
        ProjectCommands::deleteProjects(array($projectId), $project->ownerRef->asString());
    }

    public function testQuestionTemplateCRUD_CRUDOK()
    {
        $projectId = self::$environ->makeProject();

        // Initial List
        $result = self::$environ->fixJson(QuestionTemplateCommands::listTemplates($projectId));
        $existingCount = $result['count'];

        // Create
        $model = array('id'=>'','title'=>'Template Title', 'description' => 'Nice and clear description');
        $id = QuestionTemplateCommands::updateTemplate($projectId, $model);
        $this->assertNotNull($id);
        $this->assertEquals(24, strlen($id));

        // Create Second
        $model = array('id'=>'','title'=>'Template Title 2', 'description' => 'Nice and clear description 2');
        $id2 = QuestionTemplateCommands::updateTemplate($projectId, $model);

        // List
        $result = self::$environ->fixJson(QuestionTemplateCommands::listTemplates($projectId));
        $this->assertEquals($result['count'], $existingCount + 2);

        // Read
        $result = self::$environ->fixJson(QuestionTemplateCommands::readTemplate($projectId, $id));
        $this->assertNotNull($result['id']);
        $this->assertEquals('Template Title', $result['title']);
        $this->assertEquals('Nice and clear description', $result['description']);

        // Update
        $result['description'] = 'Muddled description';
        $newid = QuestionTemplateCommands::updateTemplate($projectId, $result);
        $this->assertNotNull($newid);
        $this->assertEquals($id, $newid);

        // Verify update actually changed DB
        $postUpdateResult = self::$environ->fixJson(QuestionTemplateCommands::readTemplate($projectId, $id));
        $this->assertNotNull($postUpdateResult['id']);
        $this->assertEquals($postUpdateResult['description'], 'Muddled description');

        // Delete
        $result = QuestionTemplateCommands::deleteQuestionTemplates($projectId, array($id));
        $this->assertTrue($result > 0);
        QuestionTemplateCommands::deleteQuestionTemplates($projectId, array($id2));
    }

    public function testTextCRUD_CRUDOK()
    {
        $projectId = self::$environ->makeProject();
        $project = new ProjectModel($projectId);

        $userId = self::$environ->getProjectMember($projectId, 'user1');

        // Initial List
        $result = self::$environ->fixJson(ProjectPageDto::encode($projectId, $userId));
        $count = count($result['texts']);

        // Create
        $model = array(
            'id' => '',
            'title' =>'SomeText'
        );
        $id = TextCommands::updateText($projectId, $model, $userId);
        $this->assertNotNull($id);
        $this->assertEquals(24, strlen($id));

        // Read
        $result = self::$environ->fixJson(TextCommands::readText($projectId, $id));
        $this->assertNotNull($result['id']);
        $this->assertEquals('SomeText', $result['title']);

        // Update
        $result['title'] = 'OtherText';
        $id = TextCommands::updateText($projectId, $result, $userId);
        $this->assertNotNull($id);
        $this->assertEquals($result['id'], $id);

        // Read back
        $result = self::$environ->fixJson(TextCommands::readText($projectId, $id));
        $this->assertEquals('OtherText', $result['title']);

        // List
        $result = self::$environ->fixJson(ProjectPageDto::encode($projectId, $userId));
        $this->assertCount($count + 1, $result['texts']);

        // Delete
        $result = TextCommands::deleteTexts($projectId, array($id));
        $this->assertTrue($result > 0);

        // List to confirm delete
        $result = self::$environ->fixJson(ProjectPageDto::encode($projectId, $userId));
        $this->assertCount($count, $result['texts']);

        // Clean up after ourselves
        ProjectCommands::deleteProjects(array($projectId), $project->ownerRef->asString());
    }

    public function testUserCRUD_CRUDOK()
    {
        // initial list
        $result = self::$environ->fixJson(UserCommands::listUsers());
        $count = $result['count'];

        // Create
        $userId = self::$environ->createUser('someuser', 'SomeUser','some@example.com');
        $someUser = new UserModel($userId);
        $this->assertNotNull($someUser);
        $this->assertEquals(24, strlen($someUser->id->asString()));
        // create project
        ProjectCommands::createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks', $someUser->id->asString(), self::$environ->website);

        // list
        $result = self::$environ->fixJson(UserCommands::listUsers());
        $this->assertEquals($count + 1, $result['count']);

        // Read
        $result = self::$environ->fixJson(UserCommands::readUser($someUser->id->asString()));
        $this->assertNotNull($result['id']);
        $this->assertEquals('someuser', $result['username']);
        $this->assertEquals('some@example.com', $result['email']);

        // Update
        $result['username'] = 'other';
        $result['email'] = 'other@example.com';
        $id = UserCommands::updateUser($result, self::$environ->website);
        $this->assertNotNull($id);
        $this->assertEquals($result['id'], $id);

        // typeahead
        $result = self::$environ->fixJson(UserCommands::userTypeaheadList('ome', '', self::$environ->website));
        $this->assertTrue($result['count'] > 0);

        // change password
        UserCommands::changePassword($id, 'newpassword', $id);

        // Delete
        $result = UserCommands::deleteUsers(array($id));
        $this->assertTrue($result > 0);
    }
}
