<?php

use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\commands\LexProjectCommands;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');
require_once(dirname(__FILE__) . '/LexTestData.php');

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
		
		// test for a few default values
		$this->assertEqual($project2->inputSystems['en']->tag, 'en');
		$this->assertTrue($project2->settings->tasks['dbe']->visible);
		$this->assertEqual($project2->settings->entry->fields['lexeme']->label, 'Word');
		
		// test for updated values
		$this->assertFalse($project2->settings->tasks['addMeanings']->visible);
		$this->assertEqual($project2->settings->entry->fields['lexeme']->inputSystems[0], 'my');
		$this->assertEqual($project2->settings->entry->fields['lexeme']->inputSystems[1], 'th');
	}
	
	function testImportLift_EachDuplicateSetting_LiftFileAddedOk() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$import = LexTestData::Import(LexProjectCommands::DUPLICATES_IMPORTLOSES, false);
		
		// no LIFT file initially
		$fileName = str_replace(array('/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'), '_', $import['file']['name']);	// replace special characters with _
		$filePath = $project->getAssetsFolderPath() . '/' . $fileName;
		$this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');
		
		// importLoses: LIFT file added
		LexProjectCommands::importLift($projectId, $import);
		$this->assertTrue(file_exists($filePath), 'Imported LIFT file should be in expected location');
		
		// create another LIFT file
		$filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
		@rename($filePath, $filePathOther); 
		$this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
		$this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

		// importLoses: LIFT file not added, other still exists
		LexProjectCommands::importLift($projectId, $import);
		$this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
		$this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');
		
		// importWins: LIFT file added, other removed
		$import = LexTestData::ImportSettings($import, LexProjectCommands::DUPLICATES_IMPORTWINS);
		LexProjectCommands::importLift($projectId, $import);
		$this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
		$this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
		
		// create another LIFT file
		$filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
		@rename($filePath, $filePathOther);
		$this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
		$this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');
		
		// createDuplicates: LIFT file added, other removed
		$import = LexTestData::ImportSettings($import, LexProjectCommands::DUPLICATES_ALLOW);
		LexProjectCommands::importLift($projectId, $import);
		$this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
		$this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
	}
	
}

?>
