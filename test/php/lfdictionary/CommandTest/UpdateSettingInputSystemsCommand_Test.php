<?php
use libraries\lfdictionary\commands\GetSettingInputSystemsCommand;

use libraries\lfdictionary\commands\UpdateSettingInputSystemsCommand;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(dirname(__FILE__) . '/../MockObject/LexProjectMockObject.php');

class TestOfUpdateSettingInputSystemsCommand extends UnitTestCase {
	
	//notes: all empty tags will remove in JSON -> XML progress, 
	//		so if want make a new JSON_SOURCE, please remove them first! otherwise test will failed.
	
	private $JSON_SOURCE='{"list":[{"ldml":{"identity":{"version":{"number":""},"generation":{"date":"0001-01-01T00:00:00"},"language":{"type":"en"}},"special":[]}},{"ldml":{"identity":{"version":{"number":""},"generation":{"date":"0001-01-01T00:00:00"},"language":{"type":"qaa"}},"special":[]}}]}';
	/*
	 * test in this way: JsonSource -> Xml -> JsonRes
	 * JsonSource == JsonRes
	 */
	function testUpdateSettingInputSystemsCommand_TwoEntries() {
		$this->_path = sys_get_temp_dir() . '/ldmlTestingFolder';
		if (!file_exists($this->_path)) {
			mkdir($this->_path);
		}
		
		$LexProjectMockObject = new LexProjectMockObject();
		
		$command = new UpdateSettingInputSystemsCommand($LexProjectMockObject,$this->JSON_SOURCE);
		$command->execute();
		
		// get file and to json again!
		$command = new GetSettingInputSystemsCommand($LexProjectMockObject);
		$result = json_encode($command->execute());
		$this->assertEqual($this->JSON_SOURCE, $result);
	}
}

?>