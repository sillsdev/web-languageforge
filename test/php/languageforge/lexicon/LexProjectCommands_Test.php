<?php

use models\languageforge\lexicon\LexiconProjectModel;

use models\languageforge\lexicon\commands\LexProjectCommands;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestLexProjectCommands extends UnitTestCase {

	function testReadProjectSettings_DefaultsOk() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$dto = LexProjectCommands::readSettings($projectId);
		
		// test for a few default values
		$this->assertEqual($dto['inputSystems']['en']['tag'], 'en');
		$this->assertTrue($dto['tasks']['dbe']['visible']);
		$this->assertEqual($dto['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['entry']['fields']['senses']['fields']['partOfSpeech']['label'], 'Part of Speech');
	}

	function testUpdateProjectSettings_SettingsPersist() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$settingsDto = LexProjectCommands::readSettings($projectId);
		
		$this->assertTrue($settingsDto['tasks']['addMeanings']['visible']);
		$this->assertEqual($settingsDto['entry']['fields']['lexeme']['inputSystems'][0], 'en');

		$settingsDto['tasks']['addMeanings']['visible'] = false;
		$settingsDto['entry']['fields']['lexeme']['inputSystems'] = array('my', 'th');
		
		LexProjectCommands::updateSettings($projectId, $settingsDto);
		
		$project2 = new LexiconProjectModel($projectId);
		var_dump($project2->inputSystems);
		
		// test for a few default values
		$this->assertEqual($project2->inputSystems['en']->tag, 'en');
		$this->assertTrue($project2->settings->tasks['dbe']->visible);
		$this->assertEqual($project2->settings->entry->fields['lexeme']->label, 'Word');
		/*
		
		// test for updated values
		$this->assertFalse($project2->settings->tasks['addMeanings']->visible);
		$this->assertEqual($project2->settings->entry->fields['lexeme']->inputSystems[0], 'my');
		$this->assertEqual($project2->settings->entry->fields['lexeme']->inputSystems[1], 'th');
		*/
	}
}

?>
