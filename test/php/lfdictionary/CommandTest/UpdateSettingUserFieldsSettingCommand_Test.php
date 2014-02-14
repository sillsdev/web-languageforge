<?php
use libraries\lfdictionary\commands\GetSettingUserFieldsSettingCommand;

use libraries\lfdictionary\commands\UpdateSettingUserFieldsSettingCommand;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(dirname(__FILE__) . '/../MockObject/LexProjectMockObject.php');

class UpdateSettingUserFieldsSettingCommand_Test extends UnitTestCase {

	//notes: all empty tags will remove in JSON -> XML progress,
	//		so if want make a new JSON_SOURCE, please remove them first! otherwise test will failed.
	private $NEW_DATA="{\"fields\":{\"field\":[{\"className\":{\"$\":\"LexEntry\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Word\"},\"enabled\":{\"$\":\"True\"},\"fieldName\":{\"$\":\"EntryLexicalForm\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"False\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"Visible\"},\"writingSystems\":{\"id\":[{\"$\":\"qaa\"}]},\"index\":\"1\"},{\"className\":{\"$\":\"LexEntry\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Citation Form\"},\"enabled\":{\"$\":\"False\"},\"fieldName\":{\"$\":\"citation\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"False\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"qaa\"}]},\"index\":\"2\"},{\"className\":{\"$\":\"LexSense\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Definition (Meaning)\"},\"enabled\":{\"$\":\"True\"},\"fieldName\":{\"$\":\"definition\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"True\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"Visible\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"3\"},{\"className\":{\"$\":\"LexSense\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Gloss\"},\"enabled\":{\"$\":\"False\"},\"fieldName\":{\"$\":\"gloss\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"True\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"4\"},{\"className\":{\"$\":\"LexEntry\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Literal Meaning\"},\"enabled\":{\"$\":\"False\"},\"fieldName\":{\"$\":\"literal-meaning\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"True\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"5\"},{\"className\":{\"$\":\"PalasoDataObject\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Note\"},\"enabled\":{\"$\":\"True\"},\"fieldName\":{\"$\":\"note\"},\"multiParagraph\":{\"$\":\"True\"},\"spellCheckingEnabled\":{\"$\":\"True\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"6\"},{\"className\":{\"$\":\"LexSense\"},\"dataType\":{\"$\":\"Picture\"},\"displayName\":{\"$\":\"Picture\"},\"enabled\":{\"$\":\"True\"},\"fieldName\":{\"$\":\"Picture\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"False\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"7\"},{\"className\":{\"$\":\"LexSense\"},\"dataType\":{\"$\":\"Option\"},\"displayName\":{\"$\":\"PartOfSpeech\"},\"enabled\":{\"$\":\"True\"},\"fieldName\":{\"$\":\"POS\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"False\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"optionsListFile\":{\"$\":\"PartsOfSpeech.xml\"},\"visibility\":{\"$\":\"Visible\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"8\"},{\"className\":{\"$\":\"LexExampleSentence\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Example Sentence\"},\"enabled\":{\"$\":\"True\"},\"fieldName\":{\"$\":\"ExampleSentence\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"True\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"Visible\"},\"writingSystems\":{\"id\":[{\"$\":\"qaa\"}]},\"index\":\"9\"},{\"className\":{\"$\":\"LexExampleSentence\"},\"dataType\":{\"$\":\"MultiText\"},\"displayName\":{\"$\":\"Example Translation\"},\"enabled\":{\"$\":\"False\"},\"fieldName\":{\"$\":\"ExampleTranslation\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"True\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"Visible\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"10\"},{\"className\":{\"$\":\"LexSense\"},\"dataType\":{\"$\":\"OptionCollection\"},\"displayName\":{\"$\":\"Sem Dom\"},\"enabled\":{\"$\":\"True\"},\"fieldName\":{\"$\":\"semantic-domain-ddp4\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"False\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"optionsListFile\":{\"$\":\"Ddp4.xml\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"en\"}]},\"index\":\"11\"},{\"className\":{\"$\":\"LexEntry\"},\"dataType\":{\"$\":\"RelationToOneEntry\"},\"displayName\":{\"$\":\"Base Form\"},\"enabled\":{\"$\":\"False\"},\"fieldName\":{\"$\":\"BaseForm\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"False\"},\"multiplicity\":{\"$\":\"ZeroOr1\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"qaa\"}]},\"index\":\"12\"},{\"className\":{\"$\":\"LexEntry\"},\"dataType\":{\"$\":\"RelationToOneEntry\"},\"displayName\":{\"$\":\"Cross Reference\"},\"enabled\":{\"$\":\"False\"},\"fieldName\":{\"$\":\"confer\"},\"multiParagraph\":{\"$\":\"False\"},\"spellCheckingEnabled\":{\"$\":\"False\"},\"multiplicity\":{\"$\":\"ZeroOrMore\"},\"visibility\":{\"$\":\"NormallyHidden\"},\"writingSystems\":{\"id\":[{\"$\":\"qaa\"}]},\"index\":\"13\"}]}}";
	private function recursiveDelete($str) {
		if(is_file($str)) {
			return @unlink($str);
		} elseif(is_dir($str)) {
			$str = rtrim($str, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
			$objects = scandir($str);
			foreach ($objects as $object) {
				if ($object === "." || $object === "..") {
					continue;
				}
				self::recursiveDelete($str . $object);
			}
			reset($objects);
			@rmdir($str);
		}
	}

	function testUpdateSettingUserFieldsSettingCommand_MutilEntries_ExistingSingleUserProfile() {
		/*
		 * test in this way: JsonSource -> Xml -> persist -> re-read -> Xml -> JsonRes
		* JsonSource == JsonRes
		*/
		$this->_path = sys_get_temp_dir() . '/WeSayConfigTestingFolder';
		if (!file_exists($this->_path)) {
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}else
		{
			UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}
		
		$lexProjectMockObject = new LexProjectMockObject();
		$sourceConfigFile = TEST_PATH. "/lfdictionary/data/template" . LANGUAGE_FORGE_SETTINGS . "user1.WeSayConfig";
		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . "/user1.WeSayConfig";
			
		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);

		$userName=array();
		$userName[]="user1";

		$command = new UpdateSettingUserFieldsSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserFieldsSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["fields"]["field"]), 13);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);
		UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
	}


	function testUpdateSettingUserFieldsSettingCommand_MutilEntries_NonExistingSingleUserProfile() {
		/*
		 * test in this way: JsonSource -> Xml -> persist -> re-read -> Xml -> JsonRes
		* JsonSource == JsonRes
		*/
		$this->_path = sys_get_temp_dir() . '/WeSayConfigTestingFolder';
		if (!file_exists($this->_path)) {
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}else
		{
			UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}
		$sourceConfigFile = TEST_PATH. "/lfdictionary/data/template" . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;
		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;

		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);

		$filePaths = glob($this->_path . LANGUAGE_FORGE_SETTINGS ."/*.WeSayConfig");
// 		print_r($filePaths);
		$this->assertEqual(count($filePaths), 1);

		$userName=array();
		$userName[]="user1";
		$lexProjectMockObject = new LexProjectMockObject();
		$command = new UpdateSettingUserFieldsSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserFieldsSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["fields"]["field"]), 13);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);

		$filePaths = glob($lexProjectMockObject->getUserSettingsFilePath("user1"));
		$this->assertEqual(count($filePaths), 1);
		UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
	}


	function testUpdateSettingUserFieldsSettingCommand_MutilEntries_ExistingMutilUsersProfile() {
		/*
		 * test in this way: JsonSource -> Xml -> persist(mutil-user) -> (re-read each) -> Xml -> JsonRes
		* JsonSource == JsonRes
		*/
		$this->_path = sys_get_temp_dir() . '/WeSayConfigTestingFolder';
		if (!file_exists($this->_path)) {
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}else
		{
			UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}
		$sourceConfigFile = TEST_PATH. "/lfdictionary/data/template" . LANGUAGE_FORGE_SETTINGS . "user1.WeSayConfig";

		// create 3 user profile
		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . "/user1.WeSayConfig";
		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);
// 		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . "/user2.WeSayConfig";
// 		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);
// 		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . "/user3.WeSayConfig";
// 		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);

		$userName=array();
		$userName[]="user1";
// 		$userName[]="user2";
// 		$userName[]="user3";
		$lexProjectMockObject = new LexProjectMockObject();
		$command = new UpdateSettingUserFieldsSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserFieldsSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["fields"]["field"]), 13);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);

// 		$command = new GetSettingUserFieldsSettingCommand($this->_path ,"user2");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["fields"]["field"]), 13);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);


// 		$command = new GetSettingUserFieldsSettingCommand($this->_path ,"user3");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["fields"]["field"]), 13);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);

		$filePaths = glob($lexProjectMockObject->getLanguageForgeSetting() ."/*.WeSayConfig");
		$this->assertEqual(count($filePaths), 2);

		UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
	}


	function testUpdateSettingUserFieldsSettingCommand_MutilEntries_NonExistingMutilUsersProfile() {
		/*
		 * test in this way: JsonSource -> Xml -> persist(mutil-user) -> (re-read each) -> Xml -> JsonRes
		* JsonSource == JsonRes
		*/
		$this->_path = sys_get_temp_dir() . '/WeSayConfigTestingFolder';
		if (!file_exists($this->_path)) {
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}else
		{
			UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}
		$sourceConfigFile = TEST_PATH. "/lfdictionary/data/template" . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;

		// copy default profile
		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;
		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);
		$filePaths = glob($this->_path . LANGUAGE_FORGE_SETTINGS ."/*.WeSayConfig");
		$this->assertEqual(count($filePaths), 1);

		$userName=array();
		$userName[]="user1";
// 		$userName[]="user2";
// 		$userName[]="user3";
		$lexProjectMockObject = new LexProjectMockObject();
		$command = new UpdateSettingUserFieldsSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserFieldsSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["fields"]["field"]), 13);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);

// 		$command = new GetSettingUserFieldsSettingCommand($this->_path ,"user2");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["fields"]["field"]), 13);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);


// 		$command = new GetSettingUserFieldsSettingCommand($this->_path ,"user3");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["fields"]["field"]), 13);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);

		$filePaths = glob($lexProjectMockObject->getLanguageForgeSetting()  ."/*.WeSayConfig");
		$this->assertEqual(count($filePaths), 2);

		UpdateSettingUserFieldsSettingCommand_Test::recursiveDelete($this->_path);
	}
}

?>