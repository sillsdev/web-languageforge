<?php

use models\scriptureforge\sfchecks\commands\SfchecksProjectCommands;

use libraries\shared\Website;

use models\mapper\Id;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SiteRoles;
use models\commands\UserCommands;
use models\commands\QuestionTemplateCommands;
use models\commands\QuestionCommands;
use models\commands\TextCommands;
use models\commands\ProjectCommands;
use models\scriptureforge\dto\ProjectPageDto;
use models\scriptureforge\dto\QuestionListDto;
use models\UserModel;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\QuestionTemplateModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');


class ApiCrudTestEnvironment {
	
	public $e;
	
	function __construct() {
		$this->e = new MongoTestEnvironment();
		$this->e->clean();
	}
	
	function makeProject($userId = '') {
		if (!$userId) {
			$userId = $this->makeSiteAdminUser();	
		}
		return ProjectCommands::createProject(SF_TESTPROJECT, 'sfchecks', $userId, Website::get('www.scriptureforge.org'));
	}
	
	function makeUser($username) {
		$params = array('id' => '', 'username' => $username, 'name' => $username);
		return UserCommands::updateUser($params);
	}
	
	function makeSiteAdminUser() {
		$params = array('id' => '', 'username' => 'admin', 'name' => 'admin', 'role' => SiteRoles::SYSTEM_ADMIN);
		return UserCommands::updateUser($params);
	}
	
	function makeText($projectId, $textName) {
		$model = array('id' => '', 'title' => $textName);
		return TextCommands::updateText($projectId, $model);
	}
	
	function makeQuestion($projectId) {
		$model = array('id' => '');
		return QuestionCommands::updateQuestion($projectId, $model);
	}
	
	function json($input) {
		return $this->e->fixJson($input);
	}
	
	function getProjectMember($projectId, $userName) {
		$userId = $this->e->createUser($userName, $userName, $userName);
		$user = new UserModel($userId);
		$user->addProject($projectId);
		$user->write();
		$project = new ProjectModel($projectId);
		$project->addUser($userId, ProjectRoles::CONTRIBUTOR);
		$project->write();
		return $userId;
	}
	
}

class TestApiCrud extends UnitTestCase {

	function testProjectCRUD_CRUDOK() {
		$e = new ApiCrudTestEnvironment();
		
		$userId = $e->e->createUser('userName', 'User Name', 'user@example.com', SiteRoles::SYSTEM_ADMIN);
		$id = ProjectCommands::createProject(SF_TESTPROJECT, 'sfchecks', $userId, Website::get('www.scriptureforge.org'));
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
	
	function testQuestionCRUD_CRUDOK() {
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
	
	function testQuestionTemplateCRUD_CRUDOK() {
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
	
	function testTextCRUD_CRUDOK() {
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
	
	function testUserCRUD_CRUDOK() {
		$e = new ApiCrudTestEnvironment();
		
		// initial list
		$result = $e->json(UserCommands::listUsers());
		$count = $result['count'];
		
		// Create
		$model = array(
			'id' => '',
			'username' =>'SomeUser',
			'name' =>'SomeUser',
			'email' => 'user@example.com'
		);
		$id = UserCommands::updateUser($model);
		$this->assertNotNull($id);
		$this->assertEqual(24, strlen($id));

		// list
		$result = $e->json(UserCommands::listUsers());
		$this->assertEqual($count + 1, $result['count']);
		
		// Read
		$result = $e->json(UserCommands::readUser($id));
		$this->assertNotNull($result['id']);
		$this->assertEqual('SomeUser', $result['username']);
		$this->assertEqual('user@example.com', $result['email']);
		
		// Update
		$result['email'] = 'other@example.com';
		$id = UserCommands::updateUser($result);
		$this->assertNotNull($id);
		$this->assertEqual($result['id'], $id);

		// typeahead
		$result = $e->json(UserCommands::userTypeaheadList('ome'));
		$this->assertTrue($result['count'] > 0);
		
		// change password
		UserCommands::changePassword($id, 'newpassword', $id);
		
		// Delete
 		$result = UserCommands::deleteUsers(array($id));
 		$this->assertTrue($result);
	}
}

?>
