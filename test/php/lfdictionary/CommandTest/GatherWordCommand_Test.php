<?php
use libraries\lfdictionary\commands\GatherWordCommand;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(DicTestPath . 'CommandTest/LiftTestEnvironment.php');



class TestOfGatherWordCommand extends UnitTestCase {

	private $_timePattern = '/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z/';
	private $_guidformat = '/[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/';
	
	function testGatherWordCommand_NewEntries_FileHasForm() {
	
		$e = new LiftTestEnvironment();
		$e->createLiftWith(2, 1, 0, 0, 0, 0, 0);
		
		$newwords="Unit Test On";
		
		$existwords="On Sky";
		$existarrtext = explode(" ", $existwords);
		foreach($existarrtext as $keyword)
		{
			$existresult[] = $keyword;
		}
		
		$command = new GatherWordCommand($e->getLiftFilePath(),"th",$existresult,$newwords);
		$command->execute();

		$files = glob($e->getPath() . '/*.liftupdate');
		$this->assertEqual(1, count($files));
		
		$sxml = simplexml_load_file($files[0]);
		
		$xpath = $sxml->xpath("/lift/entry/lexical-unit/form[@lang='th']/text");
		
		$this->assertEqual(2, count($xpath));
		
		$this->assertEqual('Unit', $xpath[0]);
		$this->assertEqual('Test', $xpath[1]);
		
		$xpath = $sxml->xpath("/lift/entry/@guid");
		$this->assertPattern($this->_guidformat, (string)$xpath[0]);
		$this->assertPattern($this->_guidformat, (string)$xpath[1]);
		
		$xpath = $sxml->xpath("/lift/entry/@dateCreated");
		$this->assertPattern($this->_timePattern, (string)$xpath[0]);
		$this->assertPattern($this->_timePattern, (string)$xpath[1]);
	}
	
}

?>