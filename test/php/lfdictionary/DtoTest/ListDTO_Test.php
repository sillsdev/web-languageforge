<?php
use \libraries\lfdictionary\dto\MultiText;
use \libraries\lfdictionary\dto\ListEntry;
use \libraries\lfdictionary\dto\ListDTO;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfListDTO extends UnitTestCase {

	function testListDTO_Encode_EntryAndSense_JsonCorrect() {
		$entry = new ListDTO();
		
		$multiText = new MultiText();
		$multiText->addForm("en", "meaning1");
		
		$listEntry = new ListEntry();
		$listEntry->setGuid("abcd");
		$listEntry->addEntry("fr", "entry1");
		$listEntry->addMeaning($multiText);
				
		$entry->addListEntry($listEntry);
		
		$result = json_encode($entry->encode());
		
		$this->assertEqual('{"count":0,"beginindex":0,"endindex":0,"entries":[{"guid":"abcd","entry":{"fr":"entry1"},"meanings":[{"en":"meaning1"}]}]}', $result);
	}

}

?>