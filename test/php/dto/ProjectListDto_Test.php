<?php


use models\dto\ProjectListDto;

use models\TextModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestProjectListDto extends UnitTestCase {

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}

	function testEncode_ProjectWithTexts_DtoReturnsExpectedData() {
		$e = new MongoTestEnvironment();

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

		$dto = ProjectListDto::encode();

		$this->assertEqual($dto['count'], 1);
		$this->assertIsA($dto['entries'], 'array');
		$this->assertEqual($dto['entries'][0]['id'], $projectId);
		$this->assertEqual($dto['entries'][0]['projectname'], SF_TESTPROJECT);
		$this->assertEqual($dto['entries'][0]['textCount'], 2);

	}
}

?>
