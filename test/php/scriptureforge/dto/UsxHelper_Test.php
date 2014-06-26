<?php

use models\scriptureforge\dto\UsxHelper;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestUsxHelper extends UnitTestCase {

	function testAsHtml_works() {
		$usx = MongoTestEnvironment::usxSample();

		$usxHelper = new UsxHelper($usx);
		$result = $usxHelper->toHtml();
		$this->assertPattern('/<sup>4<\\/sup>In him was life; and the life was the light of men\\./', $result);
		//echo $result;
	}

	function testAsHtml_footnotesWork() {
		$usx = MongoTestEnvironment::usxSampleWithNotes();

		$usxHelper = new UsxHelper($usx);
		$result = $usxHelper->toHtml();

		// Footnotes should be processed
		$this->assertPattern('/<div id="footnotes">.*Footnote for testing.*<\\/div>/s', $result);
		// But cross-reference notes should not
		$this->assertNoPattern('/<div id="footnotes">.*Jr 17\\.8.*<\\/div>/s', $result);
	}
	
	function testGetMetadata_Ok() {
		$usx = MongoTestEnvironment::usxSample();

		$usxHelper = new UsxHelper($usx);
		$info = $usxHelper->getMetadata();
		$this->assertEqual($info['bookCode'], 'JHN');
		$this->assertEqual($info['startChapter'], 1);
		$this->assertEqual($info['endChapter'], 21);
		$this->assertEqual($info['startVerse'], 1);
		$this->assertEqual($info['endVerse'], 25);
	}
	
}

?>
