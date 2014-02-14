<?php
use \libraries\lfdictionary\dto\MultiText;
use \libraries\lfdictionary\dto\ListEntry;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfListEntry extends UnitTestCase {

	function testEncode_JsonCorrect() {
		$multiText = MultiText::create('en', 'meaning1');

		$listEntry = new ListEntry();
		$listEntry->setGuid("abcd");
		$listEntry->addEntry("fr", "entry1");
		$listEntry->addMeaning($multiText);

		$encoded = $listEntry->encode();

		$expected = '{"guid":"abcd","entry":{"fr":"entry1"},"meanings":[{"en":"meaning1"}]}';
		$json = json_encode($encoded);
		
		$this->assertEqual($expected, $json);
	}

	function testCreateFromParts_Correct() {
		$guid = 'abcd';
		$word = array('fr' => 'entry1');
		$definitions = array(array('definition' => array('en' => 'meaning1 en', 'th' => 'meaning1 th')));
		$listEntry =ListEntry::createFromParts($guid, $word, $definitions);

		//var_dump($listEntry);
		
		$encoded = $listEntry->encode();
		
		$result = json_encode($encoded);

		$expected = '{"guid":"abcd","entry":{"fr":"entry1"},"meanings":[{"en":"meaning1 en","th":"meaning1 th"}]}';
		
		$this->assertEqual($expected, $result);
	}

}

?>