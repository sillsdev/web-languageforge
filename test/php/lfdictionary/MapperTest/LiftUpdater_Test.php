<?php

use \libraries\lfdictionary\dto\MultiText;
use \libraries\lfdictionary\dto\Example;
use \libraries\lfdictionary\dto\Sense;
use \libraries\lfdictionary\dto\EntryDTO;

use \libraries\lfdictionary\mapper\LiftUpdater;
use \libraries\lfdictionary\common\UUIDGenerate;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');

class TestOfLiftUpdater extends UnitTestCase {

	function testAddMultiText_AddsAllForms() {
		$src = <<<XML
<definition>
<form lang='en'>
<text>original text</text>
</form>
</definition>
XML;
		$srcXml = simplexml_load_string($src);
		$multitext = MultiText::create('th', 'new text');
		
		LiftUpdater::addMultiText($srcXml, $multitext);
	
		$this->assertEqual(2, count($srcXml->{'form'}));
		$xpath = $srcXml->xpath("/definition/form[@lang='th']/text");
		$this->assertEqual('new text', $xpath[0]); // new text added
		$xpath = $srcXml->xpath("/definition/form[@lang='en']/text");
		$this->assertEqual('original text', $xpath[0]); // original text remains
	}

	function testMergeMultiText_UpdatesFormNoAdd() {
		$src = <<<XML
<definition>
<form lang='en'>
<text>original text</text>
</form>
</definition>
XML;
		$srcXml = simplexml_load_string($src);
		$multitext = MultiText::create('en', 'updated text');
		
		LiftUpdater::mergeMultiText($srcXml, $multitext);
	
		$this->assertEqual(1, count($srcXml->{'form'}));
		$xpath = $srcXml->xpath("/definition/form[@lang='en']/text");
		$this->assertEqual('updated text', $xpath[0]); // updated text
	}

	function testMergeMultiText_UpdatesFormOneAdd() {
		$src = <<<XML
<definition>
<form lang='en'>
<text>original text</text>
</form>
</definition>
XML;
		$srcXml = simplexml_load_string($src);
		$multitext = MultiText::create('en', 'updated text');
		$multitext->addForm('th', 'new text');
		
		LiftUpdater::mergeMultiText($srcXml, $multitext);
	
		$this->assertEqual(2, count($srcXml->{'form'}));
		$xpath = $srcXml->xpath("/definition/form[@lang='en']/text");
		$this->assertEqual('updated text', $xpath[0]); // updated text
		$xpath = $srcXml->xpath("/definition/form[@lang='th']/text");
		$this->assertEqual('new text', $xpath[0]); // new text added
		
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}

	function testAddExampleToSense_Adds() {
		$src = <<<XML
<sense>
</sense>
XML;
		$srcXml = simplexml_load_string($src);
		$example = Example::create(
			MultiText::create('th', 'example text'),
			MultiText::create('en', 'translation text')
		);
		
		LiftUpdater::addExampleToSense($srcXml, $example);
	
		$this->assertEqual(1, count($srcXml->{'example'}));
		$xpath = $srcXml->xpath("/sense/example/form[@lang='th']/text");
		$this->assertEqual('example text', $xpath[0]);
		//$xpath = $srcXml->xpath("/sense/example/translation/form[@lang='en']/text");
		//$this->assertEqual('translation text', $xpath[0]);
	}
	
	function testMergeExample_UpdatesNoAdd() {
		$src = <<<XML
<example>
<form lang='th'>
<text>original example</text>
</form>
<translation>
<form lang='en'>
<text>original translation</text>
</form>
</translation>
</example>
XML;
		$srcXml = simplexml_load_string($src);
		$example = Example::create(
			MultiText::create('th', 'updated example'),
			MultiText::create('en', 'updated translation')
		);
		
		LiftUpdater::mergeExample($srcXml, $example);
	
		$this->assertEqual(1, count($srcXml->{'form'}));
		$this->assertEqual(1, count($srcXml->{'translation'}->{'form'}));
		$xpath = $srcXml->xpath("/example/form[@lang='th']/text");
		$this->assertEqual('updated example', $xpath[0]);
		$xpath = $srcXml->xpath("/example/translation/form[@lang='en']/text");
		$this->assertEqual('updated translation', $xpath[0]);
		
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}
	
	function testMergeSense_UpdatesProperties() {
		$src = <<<XML
<sense>
<definition>
<form lang='en'>
<text>original definition</text>
</form>
</definition>
<grammatical-info value='Noun' />
<example>
<form lang='th'>
<text>original example</text>
</form>
<translation>
<form lang='en'>
<text>original translation</text>
</form>
</translation>
</example>
</sense>
XML;
		$srcXml = simplexml_load_string($src);
		$sense = Sense::create();
		$sense->setDefinition(MultiText::create('en', 'updated definition'));
		$sense->setPartOfSpeech('updated PartOfSpeech');
		$example = Example::create(
			MultiText::create('th', 'updated example'),
			MultiText::create('en', 'updated translation')
		);
		$sense->addExample($example);
		
		LiftUpdater::mergeSense($srcXml, $sense);
	
		$this->assertEqual(1, count($srcXml->{'definition'}->{'form'}));
		$this->assertEqual(1, count($srcXml->{'grammatical-info'}));
		$this->assertEqual(1, count($srcXml->{'example'}));

		// Sense Properties
		$xpath = $srcXml->xpath("/sense/definition/form[@lang='en']/text");
		$this->assertEqual('updated definition', $xpath[0]);
		$xpath = $srcXml->xpath("/sense/grammatical-info/@value");
		$this->assertEqual('updated PartOfSpeech', (string)$xpath[0]);
		// Example
		$xpath = $srcXml->xpath("/sense/example/form[@lang='th']/text");
		$this->assertEqual('updated example', $xpath[0]);
		$xpath = $srcXml->xpath("/sense/example/translation/form[@lang='en']/text");
		$this->assertEqual('updated translation', $xpath[0]);
		
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}
	
	function testMergeSense_UpdateExampleAddExample() {
		$src = <<<XML
<sense>
<example>
<form lang='th'>
<text>original example</text>
</form>
<translation>
<form lang='en'>
<text>original translation</text>
</form>
</translation>
</example>
</sense>
XML;
		$srcXml = simplexml_load_string($src);
		$sense = Sense::create();
		$example = Example::create(
			MultiText::create('th', 'updated example'),
			MultiText::create('en', 'updated translation')
		);
		$sense->addExample($example);
		$example = Example::create(
			MultiText::create('th', 'new example'),
			MultiText::create('en', 'new translation')
		);
		$sense->addExample($example);
		
		LiftUpdater::mergeSense($srcXml, $sense);
	
		$this->assertEqual(2, count($srcXml->{'example'}));

		// Example
		$xpath = $srcXml->xpath("/sense/example[1]/form[@lang='th']/text");
		$this->assertEqual('updated example', $xpath[0]);
		$xpath = $srcXml->xpath("/sense/example[1]/translation/form[@lang='en']/text");
		$this->assertEqual('updated translation', $xpath[0]);
		$xpath = $srcXml->xpath("/sense/example[2]/form[@lang='th']/text");
		$this->assertEqual('new example', $xpath[0]);
		//$xpath = $srcXml->xpath("/sense/example[2]/translation/form[@lang='en']/text");
		//$this->assertEqual('new translation', $xpath[0]);
		
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}
	
	function testMergeSense_WithExtraField_FieldRemains() {
		$src = <<<XML
<sense>
<definition>
<form lang='en'>
<text>original definition</text>
</form>
</definition>
<field>some field</field>
</sense>
XML;
		$srcXml = simplexml_load_string($src);
		$sense = Sense::create();
		$sense->setDefinition(MultiText::create('en', 'updated definition'));
		
		LiftUpdater::mergeSense($srcXml, $sense);
	
		$xpath = $srcXml->xpath("/sense/field");
		$this->assertEqual('some field', $xpath[0]);
		$xpath = $srcXml->xpath("/sense/definition/form[@lang='en']/text");
		$this->assertEqual('updated definition', $xpath[0]);
		
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}

	function testAddSenseToEntry_Adds() {
		$src = <<<XML
<entry>
</entry>
XML;
		$srcXml = simplexml_load_string($src);
		$sense = Sense::create();
		$sense->setDefinition(MultiText::create('en', 'new definition'));
		
		LiftUpdater::addSenseToEntry($srcXml, $sense);
	
		$this->assertEqual(1, count($srcXml->{'sense'}));
		$xpath = $srcXml->xpath("/entry/sense/definition/form[@lang='en']/text");
		$this->assertEqual('new definition', $xpath[0]);
	}

	function testMergeEntry_UpdatesProperties() {
		$src = <<<XML
<entry>
<lexical-unit>
<form lang='th'>
<text>original form</text>
</form>
</lexical-unit>
<sense>
<definition>
<form lang='en'>
<text>original definition</text>
</form>
</definition>
</sense>
</entry>
XML;
		$srcXml = simplexml_load_string($src);
		$guid = UUIDGenerate::uuid_generate_php();
		$entry = EntryDTO::create($guid);
		$entry->setEntry(MultiText::create('th', 'updated form'));
		$sense = Sense::create();
		$sense->setDefinition(MultiText::create('en', 'updated definition'));
		$entry->addSense($sense);
		
		LiftUpdater::mergeEntry($srcXml, $entry);
	
		$this->assertEqual(1, count($srcXml->{'lexical-unit'}->{'form'}));
		$this->assertEqual(1, count($srcXml->{'sense'}));

		// Entry Properties
		$xpath = $srcXml->xpath("/entry/lexical-unit/form[@lang='th']/text");
		$this->assertEqual('updated form', $xpath[0]);
		// Sense Properties
		$xpath = $srcXml->xpath("/entry/sense/definition/form[@lang='en']/text");
		$this->assertEqual('updated definition', $xpath[0]);
		
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}

	function testMergeEntry_UpdateSenseAddSense() {
		$src = <<<XML
<entry>
<lexical-unit>
<form lang='th'>
<text>original form</text>
</form>
</lexical-unit><sense>
<definition>
<form lang='en'>
<text>original definition</text>
</form>
</definition>
</sense>
</entry>
XML;
		$srcXml = simplexml_load_string($src);
		$guid = UUIDGenerate::uuid_generate_php();
		$entry = EntryDTO::create($guid);
		$entry->setEntry(MultiText::create('th', 'updated form'));
		$sense = Sense::create();
		$sense->setDefinition(MultiText::create('en', 'updated definition'));
		$entry->addSense($sense);
		$sense = Sense::create();
		$sense->setDefinition(MultiText::create('en', 'new definition'));
		$entry->addSense($sense);
		
		LiftUpdater::mergeEntry($srcXml, $entry);
	
		$this->assertEqual(2, count($srcXml->{'sense'}));

		// Sense
		$xpath = $srcXml->xpath("/entry/sense[1]/definition/form[@lang='en']/text");
		$this->assertEqual('updated definition', $xpath[0]);
		$xpath = $srcXml->xpath("/entry/sense[2]/definition/form[@lang='en']/text");
		$this->assertEqual('new definition', $xpath[0]);
		
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}
	
	function testMergeEntry_WithExtraField_FieldRemains() {
		$src = <<<XML
<entry>
<lexical-unit>
<form lang='th'>
<text>original form</text>
</form>
</lexical-unit>
<field>some field</field>
</entry>
XML;
		$srcXml = simplexml_load_string($src);
		$guid = UUIDGenerate::uuid_generate_php();
		$entry = EntryDTO::create($guid);
		$entry->setEntry(MultiText::create('th', 'updated form'));
		
		LiftUpdater::mergeEntry($srcXml, $entry);
	
		$this->assertEqual(1, count($srcXml->{'lexical-unit'}->{'form'}));

		// Entry Properties
		$xpath = $srcXml->xpath("/entry/lexical-unit/form[@lang='th']/text");
		$this->assertEqual('updated form', $xpath[0]);
		$xpath = $srcXml->xpath("/entry/field");
		$this->assertEqual('some field', $xpath[0]);
				
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}

	function testMergeEntry_EmptyEntry() {
		$src = <<<XML
<entry>
</entry>
XML;
		$srcXml = simplexml_load_string($src);
		$guid = UUIDGenerate::uuid_generate_php();
		$entry = EntryDTO::create($guid);
		$entry->setEntry(MultiText::create('th', 'new form'));
		
		LiftUpdater::mergeEntry($srcXml, $entry);
	
		$this->assertEqual(1, count($srcXml->{'lexical-unit'}->{'form'}));

		// Entry Properties
		$xpath = $srcXml->xpath("/entry/lexical-unit/form[@lang='th']/text");
		$this->assertEqual('new form', $xpath[0]);
				
		//print_r($xpath);
		//print_r(htmlentities($srcXml->asXml()));
	}
	
}

?>