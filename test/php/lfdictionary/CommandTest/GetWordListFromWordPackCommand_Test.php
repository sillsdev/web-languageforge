<?php
use libraries\lfdictionary\dto\ListDTO;

use libraries\lfdictionary\commands\GetWordListFromWordPackCommand;

use libraries\lfdictionary\dto\ListEntry;

use libraries\lfdictionary\dto\MultiText;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(DicTestPath . 'CommandTest/LiftTestEnvironment.php');

class TestOfGetWordPackListCommand extends UnitTestCase {

	function testWordPackListCommand_TwoEntries() {
		$listDto = new ListDTO();

		$multiText1 = new MultiText();
		$multiText1->addForm("en", "meaning1");
		$listEntry1 = new ListEntry();
		$listEntry1->setGuid("guid0");
		$listEntry1->addEntry("fr", "entry1");
		$listEntry1->addMeaning($multiText1);

		$multiText2 = new MultiText();
		$multiText2->addForm("en", "meaning1");
		$listEntry2 = new ListEntry();
		$listEntry2->setGuid("guid1");
		$listEntry2->addEntry("fr", "entry1");
		$listEntry2->addMeaning($multiText1);

		$listDto->addListEntry($listEntry1);
		$listDto->addListEntry($listEntry2);
		
		$sorceLiftFile = new LiftTestEnvironment();
		$sorceLiftFile->createLiftWith(4, 1, 0, 0, 0, 0, 0);

		$command = new GetWordListFromWordPackCommand($listDto, $sorceLiftFile->getLiftFilePath());
		$result = $command->execute();

		$this->assertEqual(2, count($result->_entries));
		$this->assertEqual(2, $result->entryCount);
	}
}

?>