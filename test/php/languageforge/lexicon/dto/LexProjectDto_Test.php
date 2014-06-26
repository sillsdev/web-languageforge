<?php

use models\shared\rights\SiteRoles;

use models\languageforge\lexicon\dto\LexProjectDto;
use models\shared\rights\ProjectRoles;
use models\UserModel;

require_once(dirname(__FILE__) . '/../../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestLexProjectDto extends UnitTestCase {
	
	function testEncode_Project_DtoCorrect() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser("User", "Name", "name@example.com");
		$user = new UserModel($userId);
		$user->role = SiteRoles::USER;

		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$project->interfaceLanguageCode = 'en';
		$project->projectCode = 'lf';
		$project->featured = true;
		
		$project->addUser($userId, ProjectRoles::CONTRIBUTOR);
		$user->addProject($projectId);
		$user->write();
		$project->write();
				
		$dto = LexProjectDto::encode($projectId, $userId);
		
		// test for a few default values
		$this->assertEqual($dto['config']['inputSystems']['en']['tag'], 'en');
		$this->assertTrue($dto['config']['tasks']['dbe']['visible']);
		$this->assertEqual($dto['config']['entry']['type'], 'fields', 'dto config is not valid');
		$this->assertEqual($dto['config']['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['config']['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['config']['entry']['fields']['senses']['fields']['partOfSpeech']['label'], 'Part of Speech');
		$this->assertEqual($dto['project']['projectName'], SF_TESTPROJECT);
		$this->assertEqual($dto['project']['interfaceLanguageCode'], 'en');
		$this->assertEqual($dto['project']['projectCode'], 'lf');
		$this->assertTrue($dto['project']['featured']);
		$this->assertTrue(count($dto['rights']) > 0, "No rights in dto");
	}
	
}

?>
