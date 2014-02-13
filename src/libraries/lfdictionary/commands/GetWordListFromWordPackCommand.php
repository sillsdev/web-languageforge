<?php

namespace libraries\lfdictionary\commands;
require_once(dirname(__FILE__) . '/../Config.php');

use dto\ListDTO;
use libraries\lfdictionary\common\LoggerFactory;
class GetWordListFromWordPackCommand
{
	/**
	 *  @var ListDTO
	 */
	var $existWordList;

	/**
	 *  @var String
	 */
	var $sourceFile;

	/**
	 * @var EntryListDTO
	 */
	var $_dto;



	function __construct($listDTO, $sourceLifeFile) {
		$this->existWordList = $listDTO;
		$this->sourceFile = $sourceLifeFile;

		if (!file_exists($this->sourceFile))
		{
			throw new \Exception('Lift file is missing on server: ' . $this->sourceFile);
				
		}

		$this->_dto = new \libraries\lfdictionary\dto\EntryListDTO();
	}

	function execute() {
		$this->processFile();
		return $this->_dto;
	}

	function processFile() {
		$existWordGuids = array();
		foreach ($this->existWordList->entries as $entry) {
			// keep only Guid for new word identification
			$guidKey = (string)$entry->guid;
			if ($guidKey!==''){
				$existWordGuids[$guidKey] = $guidKey;
			}
		}

		$reader = new \XMLReader();

		$NewWordXMLdatas = array();

		//open the new word list
		$reader->open($this->sourceFile);
		// read all entery from new word lift file
		while ($reader->read()) {
			switch ($reader->nodeType) {
				case (\XMLREADER::ELEMENT):
					if ($reader->name == "entry") {
						$node = $reader->expand();
						$dom = new \DomDocument();
						$dom->importNode($node,true);
						$dom->appendChild($node);
						$XMLdata = simplexml_import_dom($node);
						$lexicalForms = $XMLdata->{'lexical-unit'};
						if ($lexicalForms && (!array_key_exists((string)$XMLdata->attributes()->guid, $existWordGuids))) {
							// this is a new word
							$NewWordXMLdatas[] = $XMLdata;
							LoggerFactory::getLogger()->logDebugMessage("".$XMLdata->attributes()->guid);
							$this->processModelFromNode($XMLdata);
						}
					}
			}
		}
		$reader->close();

		LoggerFactory::getLogger()->logDebugMessage(count($NewWordXMLdatas));
		$this->_dto->entryCount = count($NewWordXMLdatas);

	}

	function processModelFromNode($node) {

		$entry = null;
		$lexicalForms = $node->{'lexical-unit'};
		if ($lexicalForms) {
			$entry = \libraries\lfdictionary\dto\EntryDTO::create((string)$node['guid']);
			$entry->setEntry($this->readMultiText($lexicalForms));
			if(isset($node->{'sense'})) {
				foreach ($node->{'sense'} as $sense) {
					$entry->addSense($this->readSense($sense));
				}
			} else {
				$definition = $node->addChild('sense');
				$definition->definition->form['lang'] = 'en';
				$entry->addSense($this->readSense($definition));
			}
		}

		$this->_dto->addEntry($entry);
	}

	function readMultiText($node) {
		$multiText = new \libraries\lfdictionary\dto\MultiText();
		foreach ($node->{'form'} as $form) {
			$multiText->addForm((string)$form['lang'], (string)$form->{'text'});
		}
		return $multiText;
	}

	function readSense($node) {
		$sense = new \libraries\lfdictionary\dto\Sense();

		//Definition
		$definition = $node->{'definition'};
		$sense->setDefinition($this->readMultiText($definition));

		//Part Of Speech
		if(isset($node->{'grammatical-info'})) {
			$partOfSpeech = (string)$node->{'grammatical-info'}->attributes()->value;
			$sense->setPartOfSpeech($partOfSpeech);
		}

		//Semantic Domain
		if(isset($node->{'trait'})) {
			$semanticDomainName = (string)$node->{'trait'}->attributes()->name;
			$semanticDomainValue = (string)$node->{'trait'}->attributes()->value;
			$sense->setSemanticDomainName($semanticDomainName);
			$sense->setSemanticDomainValue($semanticDomainValue);
		}

		//Examples
		$examples = $node->{'example'};
		if ($examples) {
			foreach ($examples as $example) {
				$sense->addExample($this->readExample($example));
			}
		}

		return $sense;
	}

	function readExample($node) {

		$example = new \dto\Example();

		// Example multitext
		$exampleXml = $node;
		$example->setExample($this->readMultiText($exampleXml));
		// Translation multitext
		$translationXml = $node->{'translation'};
		if(!empty($translationXml)) {
			$example->setTranslation($this->readMultiText($translationXml));
		} else {
			$translation = $node->addChild('translation');
			$translation->form['lang'] = 'en';
			$example->setTranslation($this->readMultiText($translation));
		}
		return $example;
	}


};

?>