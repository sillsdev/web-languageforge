<?php

use models\shared\dto\ProjectListDto;
use models\TextModel;
use models\UserModel;
use models\rights\Roles;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestProjectListDto extends UnitTestCase {

	function testEncode_ProjectWithTexts_DtoReturnsTextCount2() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser("User", "Name", "name@example.com");
		$user = new UserModel($userId);
		$user->role = Roles::SYSTEM_ADMIN;
		$user->write();

		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();

		$text1 = new TextModel($project);
		$text1->title = "Chapter 3";
		$text1->content = "I opened my eyes upon a strange and weird landscape. I knew that I was on Mars; …";
		$text1Id = $text1->write();

		$text2 = new TextModel($project);
		$text2->title = "Chapter 4";
		$text2->content = "We had gone perhaps ten miles when the ground began to rise very rapidly. …";
		$text2Id = $text2->write();

		$dto = ProjectListDto::encode($userId);

		$this->assertEqual($dto['count'], 1);
		$this->assertIsA($dto['entries'], 'array');
		$this->assertEqual($dto['entries'][0]['id'], $projectId);
		$this->assertEqual($dto['entries'][0]['projectname'], SF_TESTPROJECT);
		$this->assertEqual($dto['entries'][0]['textCount'], 2);
		$this->assertEqual($dto['entries'][0]['role'], Roles::NONE);
	}

	function testEncode_SiteAdmin2Projects_DtoReturnsProjectCount2() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser("User", "Name", "name@example.com");
		$user = new UserModel($userId);
		$user->role = Roles::SYSTEM_ADMIN;
		$user->write();
	
		$project1Name = 'SF_TESTPROJECT';
		$project1 = $e->createProject($project1Name);
		$projectId1 = $project1->id->asString();
		$project1->addUser($userId, Roles::PROJECT_ADMIN);
		$project1->write();
		
		$project2Name = 'SF_TESTPROJECT2';
		$project2 = $e->createProject($project2Name);
		$projectId2 = $project2->id->asString();
		
		$dto = ProjectListDto::encode($userId);
	
		$this->assertEqual($dto['count'], 2);
		$this->assertIsA($dto['entries'], 'array');
		$this->assertEqual($dto['entries'][0]['id'], $projectId1);
		$this->assertEqual($dto['entries'][0]['projectname'], $project1Name);
		$this->assertEqual($dto['entries'][0]['role'], Roles::PROJECT_ADMIN);
		$this->assertEqual($dto['entries'][1]['id'], $projectId2);
		$this->assertEqual($dto['entries'][1]['projectname'], $project2Name);
		$this->assertEqual($dto['entries'][1]['role'], Roles::NONE);
	}
	
	function testEncode_UserOf1Project2Projects_DtoReturnsProjectCount1() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser("User", "Name", "name@example.com");
		$user = new UserModel($userId);
		$user->role = Roles::USER;
		$user->write();
	
		$project1Name = 'SF_TESTPROJECT';
		$project1 = $e->createProject($project1Name);
		$projectId1 = $project1->id->asString();
		$project1->addUser($userId, Roles::USER);
		$project1->write();
		
		$project2Name = 'SF_TESTPROJECT2';
		$project2 = $e->createProject($project2Name);
		$projectId2 = $project2->id->asString();
		
		$dto = ProjectListDto::encode($userId);
	
		$this->assertEqual($dto['count'], 1);
		$this->assertIsA($dto['entries'], 'array');
		$this->assertEqual($dto['entries'][0]['id'], $projectId1);
		$this->assertEqual($dto['entries'][0]['projectname'], $project1Name);
		$this->assertEqual($dto['entries'][0]['role'], Roles::USER);
	}

}

?>
