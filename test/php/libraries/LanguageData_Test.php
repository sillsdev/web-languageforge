<?php

use libraries\shared\LanguageData;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class TestParatextExport extends UnitTestCase {

	function testLanguageData_ThreeLetterCodesExist() {
		$tag = 'eng';
		$name = $tag;
		$languages = new LanguageData();
		$languageCode = $languages->getCode($tag);
		if (key_exists($languageCode, $languages)) {
			$name = $languages[$languageCode]->name;
		}
		
		$this->assertEqual($name, "English");
	}

}
