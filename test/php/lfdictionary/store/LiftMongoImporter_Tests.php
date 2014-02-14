<?php


use libraries\lfdictionary\store\LiftImporterUpdatePolicy;
use libraries\lfdictionary\store\mongo\LiftMongoImporter;


require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once('MongoTestEnvironment.php');
require_once('LiftTestEnvironment.php');

class TestOfLiftMongoImporter extends UnitTestCase {
 
	function setUp() {
		$me = MongoTestEnvironment::create();
		$me->removeAll();
	}
	
	function tearDown() {
		$me = MongoTestEnvironment::create();
		$me->removeAll();
	}
	
	const liftTwoEntries = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2009-10-12T04:05:40Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̂ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูรอบ</text>
			</form>
		</lexical-unit>
	</entry>
	<entry
		id="05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;
	
		function testUpdate_LiftWithTwoEntires_CreateTwoEntriesAndReadOne() {
			$me = MongoTestEnvironment::create();
			$le = StoreLiftTestEnvironment::create();
			$le->writeLiftToFile(self::liftTwoEntries);
			$importer = new LiftMongoImporter($le->getLiftFilePath(), $me->database);
			$importer->update(LiftImporterUpdatePolicy::OVERWRITE);	
			
			$store = $me->testStore();
			$count = $store->entryCount();
			$this->assertEqual(2, $count);
			
			$entry1 = $store->readEntry('dd15cbc4-9085-4d66-af3d-8428f078a7da');
			$this->assertNotNull($entry1);
		}

		// TODO Add more tests for Definition, Sense, Example etc.  Or expand the test above. CP 2012-11
		
	
}

?>
