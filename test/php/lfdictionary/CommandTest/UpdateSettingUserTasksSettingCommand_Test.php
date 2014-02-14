<?php
use libraries\lfdictionary\commands\GetSettingUserTasksSettingCommand;

use libraries\lfdictionary\commands\UpdateSettingUserTasksSettingCommand;
use libraries\lfdictionary\environment\LexProject;
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(dirname(__FILE__) . '/../MockObject/LexProjectMockObject.php');
class UpdateSettingUserTasksSettingCommand_Test extends UnitTestCase {

	
	
	//notes: all empty tags will remove in JSON -> XML progress,
	//		so if want make a new JSON_SOURCE, please remove them first! otherwise test will failed.
	private $NEW_DATA="{\"tasks\":{\"task\":[{\"taskName\":\"Dashboard\",\"visible\":\"true\",\"index\":\"1\"},{\"taskName\":\"Dictionary\",\"visible\":\"true\",\"index\":\"2\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Meanings\"},\"longLabel\":{\"$\":\"Add Meanings\"},\"description\":{\"$\":\"Add meanings (senses) to entries where they are missing.\"},\"field\":{\"$\":\"definition\"},\"showFields\":{\"$\":\"definition\"},\"readOnly\":{\"$\":\"semantic-domain-ddp4\"},\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"3\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Parts of Speech\"},\"longLabel\":{\"$\":\"Add Parts of Speech\"},\"description\":{\"$\":\"Add parts of speech to senses where they are missing.\"},\"field\":{\"$\":\"POS\"},\"showFields\":{\"$\":\"POS\"},\"readOnly\":{\"$\":\"definition, ExampleSentence\"},\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"4\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Example Sentences\"},\"longLabel\":{\"$\":\"Add Example Sentences\"},\"description\":{\"$\":\"Add example sentences to senses where they are missing.\"},\"field\":{\"$\":\"ExampleSentence\"},\"showFields\":{\"$\":\"ExampleSentence\"},\"readOnly\":{\"$\":\"definition\"},\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"5\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Base Forms\"},\"longLabel\":{\"$\":\"Add Base Forms\"},\"description\":{\"$\":\"Identify the \\\"base form\\\" word that this word is built from. In the printed dictionary, the derived or variant words can optionally be shown as subentries of their base forms.\"},\"field\":{\"$\":\"BaseForm\"},\"showFields\":{\"$\":\"BaseForm\"},\"readOnly\":[],\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"6\"},{\"taskName\":\"AdvancedHistory\",\"visible\":\"false\",\"index\":\"7\"},{\"taskName\":\"NotesBrowser\",\"visible\":\"false\",\"index\":\"8\"},{\"taskName\":\"GatherWordList\",\"visible\":\"false\",\"wordListFileName\":{\"$\":\"SILCAWL\"},\"wordListWritingSystemId\":{\"$\":\"en\"},\"index\":\"9\"},{\"taskName\":\"GatherWordList\",\"visible\":\"false\",\"wordListFileName\":{\"$\":\"SILCAWL-MozambiqueAddendum\"},\"wordListWritingSystemId\":{\"$\":\"en\"},\"index\":\"10\"},{\"taskName\":\"GatherWordsBySemanticDomains\",\"visible\":\"true\",\"semanticDomainsQuestionFileName\":{\"$\":\"Ddp4Questions-en.xml\"},\"showMeaningField\":{\"$\":\"False\"},\"index\":\"11\"}]}}";
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

	function testUpdateSettingUserTasksSettingCommand_MutilEntries_ExistingSingleUserProfile() {
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
			self::recursiveDelete($this->_path);
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}
		
		$lexProjectMockObject = new LexProjectMockObject();
		
		$sourceConfigFile = TEST_PATH. "/lfdictionary/data/template" . LANGUAGE_FORGE_SETTINGS . "user1.WeSayConfig";
		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . "/user1.WeSayConfig";

		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);

		$userName=array();
		$userName[]="user1";

		$command = new UpdateSettingUserTasksSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["tasks"]["task"]), 11);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);
		UpdateSettingUserTasksSettingCommand_Test::recursiveDelete($this->_path);
	}


	function testUpdateSettingUserTasksSettingCommand_MutilEntries_NonExistingSingleUserProfile() {
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
			self::recursiveDelete($this->_path);
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}
		$sourceConfigFile = TEST_PATH. "/lfdictionary/data/template" . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;
		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;

		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);

		$filePaths = glob($this->_path . LANGUAGE_FORGE_SETTINGS ."/*.WeSayConfig");

		$isPatchincludeDefault = false;

		foreach ($filePaths as $file) {
			if ($this::endsWith($file, "/" . LANGUAGE_FORGE_DEFAULT_SETTINGS)){
				$isPatchincludeDefault = true;
			}
		}
		if ($isPatchincludeDefault){
			$this->assertEqual(count($filePaths),1);
		}else{
			$this->assertEqual(count($filePaths),0);
		}

		$userName=array();
		$userName[]="user1";

		$lexProjectMockObject = new LexProjectMockObject();
		$command = new UpdateSettingUserTasksSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["tasks"]["task"]), 11);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);

		$filePaths = glob($lexProjectMockObject->getUserSettingsFilePath("user1") );
		$this->assertEqual(count($filePaths),1);
		UpdateSettingUserTasksSettingCommand_Test::recursiveDelete($this->_path);
	}


	function testUpdateSettingUserTasksSettingCommand_MutilEntries_ExistingMutilUsersProfile() {
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
			self::recursiveDelete($this->_path);
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
		$command = new UpdateSettingUserTasksSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["tasks"]["task"]), 11);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);

// 		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user2");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["tasks"]["task"]), 11);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);


// 		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user3");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["tasks"]["task"]), 11);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);

		$filePaths = glob($this->_path . LANGUAGE_FORGE_SETTINGS ."/*.WeSayConfig");

		$isPatchincludeDefault = false;

		foreach ($filePaths as $file) {
			if ($this::endsWith($file, "/" . LANGUAGE_FORGE_DEFAULT_SETTINGS)){
				$isPatchincludeDefault = true;
			}
		}
		if ($isPatchincludeDefault){
			$this->assertEqual(count($filePaths),4);
		}else{
			$this->assertEqual(count($filePaths),1);
		}


		UpdateSettingUserTasksSettingCommand_Test::recursiveDelete($this->_path);
	}


	function testUpdateSettingUserTasksSettingCommand_MutilEntries_NonExistingMutilUsersProfile() {
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
			self::recursiveDelete($this->_path);
			mkdir($this->_path);
			mkdir($this->_path . LANGUAGE_FORGE_SETTINGS );
		}
		$sourceConfigFile = TEST_PATH. "/lfdictionary/data/template" . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;

		// copy default profile
		$TargetConfigFile = $this->_path . LANGUAGE_FORGE_SETTINGS . LANGUAGE_FORGE_DEFAULT_SETTINGS;
		$this->assertEqual(copy($sourceConfigFile, $TargetConfigFile),true);
		$filePaths = glob($this->_path . LANGUAGE_FORGE_SETTINGS ."/*.WeSayConfig");
		foreach ($filePaths as $file) {
			if ($this::endsWith($file, "/" . LANGUAGE_FORGE_DEFAULT_SETTINGS)){
				$isPatchincludeDefault = true;
			}
		}
		if ($isPatchincludeDefault){
			$this->assertEqual(count($filePaths),1);
		}else{
			$this->assertEqual(count($filePaths),0);
		}


		$userName=array();
		$userName[]="user1";
// 		$userName[]="user2";
// 		$userName[]="user3";
		$lexProjectMockObject = new LexProjectMockObject();
		$command = new UpdateSettingUserTasksSettingCommand($lexProjectMockObject ,$userName, $this->NEW_DATA);
		$command->execute();

		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["tasks"]["task"]), 11);
		$this->assertEqual(json_encode($result), $this->NEW_DATA);

// 		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user2");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["tasks"]["task"]), 11);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);


// 		$command = new GetSettingUserTasksSettingCommand($lexProjectMockObject ,"user3");
// 		$result = $command->execute();
// 		$this->assertEqual(count($result["tasks"]["task"]), 11);
// 		$this->assertEqual(json_encode($result), $this->NEW_DATA);

		$filePaths = glob($lexProjectMockObject->getLanguageForgeSetting() ."/*.WeSayConfig");
		$isPatchincludeDefault = false;

		foreach ($filePaths as $file) {
			if ($this::endsWith($file, "/" . LANGUAGE_FORGE_DEFAULT_SETTINGS)){
				$isPatchincludeDefault = true;
			}
		}
		if ($isPatchincludeDefault){
			$this->assertEqual(count($filePaths),2);
		}else{
			$this->assertEqual(count($filePaths),1);
		}


		self::recursiveDelete($this->_path);
	}

	private function endsWith($haystack, $needle)
	{
		$length = strlen($needle);
		if ($length == 0) {
			return true;
		}

		return (substr($haystack, -$length) === $needle);
	}
}

?>