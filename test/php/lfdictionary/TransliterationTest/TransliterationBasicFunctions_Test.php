<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');

use libraries\lfdictionary\Transliteration\WordTransliterationFilter;

class TestOfTransliteration extends UnitTestCase {

	const WORD_CHINESE = '中文';
	const WORD_THAI = 'ภาษาไทย';
	const WORD_THAI_SPECIAL = 'ไกล';
	const WORD_ENGLISH = 'English';
	const WORD_JAPANESE = 'にほん';
	const WORD_KOREAN = '한국의';
	const WORD_GERMAN = 'Änderung';

	const WORD_CHINESE_TRANSFERED = 'Zhong Wen';
	const WORD_THAI_TRANSFERED = 'phaasaaaithy';
	const WORD_THAI_TRANSFERED_SPECIAL = 'aikl';
	const WORD_ENGLISH_TRANSFERED = 'English';
	const WORD_JAPANESE_TRANSFERED = 'nihon';
	const WORD_KOREAN_TRANSFERED = 'hangugyi';
	const WORD_GERMAN_TRANSFERED = 'Aenderung';

	function testNormalTransliteration() {
		$transliteration = new WordTransliterationFilter();
		$this->assertEqual($this::WORD_CHINESE_TRANSFERED, $transliteration->transliterate($this::WORD_CHINESE, "zh_Hans"));
		$this->assertEqual($this::WORD_THAI_TRANSFERED, $transliteration->transliterate($this::WORD_THAI, "th"));
		$this->assertEqual($this::WORD_THAI_TRANSFERED_SPECIAL, $transliteration->transliterate($this::WORD_THAI_SPECIAL, "th"));
		$this->assertEqual($this::WORD_ENGLISH_TRANSFERED, $transliteration->transliterate($this::WORD_ENGLISH, "en"));
		$this->assertEqual($this::WORD_JAPANESE_TRANSFERED, $transliteration->transliterate($this::WORD_JAPANESE, "ja"));
		$this->assertEqual($this::WORD_KOREAN_TRANSFERED, $transliteration->transliterate($this::WORD_KOREAN, "ko"));
		$this->assertEqual($this::WORD_GERMAN_TRANSFERED, $transliteration->transliterate($this::WORD_GERMAN, "de"));
	}

	function testTransliterationBeginWitTitleLetter_True() {
		$transliteration = new WordTransliterationFilter();
		$this->assertTrue($transliteration->isWordStartWithTitleLetter('Zh', $this::WORD_CHINESE, "zh_Hans"));
 		$this->assertTrue($transliteration->isWordStartWithTitleLetter('ภ',  $this::WORD_THAI, "th"));
 		$this->assertTrue($transliteration->isWordStartWithTitleLetter('ก',  $this::WORD_THAI_SPECIAL, "th"));
 		$this->assertTrue($transliteration->isWordStartWithTitleLetter('en', $this::WORD_ENGLISH, "en"));
 		//$this->assertTrue($transliteration->isWordStartWithTitleLetter('な', $this::WORD_JAPANESE, "ja"));
 		$this->assertTrue($transliteration->isWordStartWithTitleLetter('ㅎ', $this::WORD_KOREAN, "ko"));
 		$this->assertTrue($transliteration->isWordStartWithTitleLetter('A', $this::WORD_GERMAN, "de"));
	}
	
	function testTransliterationBeginWitTitleLetter_False() {
		$transliteration = new WordTransliterationFilter();
		$this->assertFalse($transliteration->isWordStartWithTitleLetter('Ch', $this::WORD_CHINESE, "zh_Hans"));
		$this->assertFalse($transliteration->isWordStartWithTitleLetter('h', $this::WORD_CHINESE, "zh_Hans"));
		$this->assertFalse($transliteration->isWordStartWithTitleLetter('า',  $this::WORD_THAI, "th"));
		$this->assertFalse($transliteration->isWordStartWithTitleLetter('ไ',  $this::WORD_THAI_SPECIAL, "th"));
		$this->assertFalse($transliteration->isWordStartWithTitleLetter('n', $this::WORD_ENGLISH, "en"));
		//$this->assertFalse($transliteration->isWordStartWithTitleLetter('な', $this::WORD_JAPANESE, "ja"));
		$this->assertFalse($transliteration->isWordStartWithTitleLetter('ㄴ', $this::WORD_KOREAN, "ko"));
		$this->assertFalse($transliteration->isWordStartWithTitleLetter('E', $this::WORD_GERMAN, "de"));
	}
}
?>