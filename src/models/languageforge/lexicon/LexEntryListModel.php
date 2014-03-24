<?php 
namespace models\languageforge\lexicon;

use models\languageforge\lexicon\commands\LexEntryCommands;

use models\languageforge\lexicon\settings\LexiconConfigObj;

class LexEntryListModel extends \models\mapper\MapperListModel {

	public static function mapper($databaseName) {
		static $instance = null;
		if (null === $instance) {
			$instance = new \models\mapper\MongoMapper($databaseName, 'lexicon');
		}
		return $instance;
	}

	public function __construct($projectModel) {
		parent::__construct( self::mapper($projectModel->databaseName()), array(), array('guid', 'lexeme', 'senses'));
	}
	
	private function getDefinition($entry) {
		$senses = $entry['senses'];
		$definition = new \stdClass();
		if (count($senses) > 0 && array_key_exists('definition', $senses[0]) && count($senses[0]['definition']) > 0) {
			// TODO: actually figure out the preferred writing system for display and use that
			$definition = $senses[0]['definition'];
			$defKeys = array_keys($definition);
			return $definition[$defKeys[0]]['value'];
		}
		return $definition;
	}
	
	private function getLexeme($entry) {
		$lexeme = $entry['lexeme'];
		if (count($lexeme) > 0) {
			// TODO: actually figure out the preferred writing system for display and use that
			$lexKeys = array_keys($lexeme);
			return $lexeme[$lexKeys[0]]['value'];
		}
		return $definition;
	}
	
	public function readForDto($missingInfo = '') {
		parent::read();
		$entriesToReturn = array();
		
		if ($missingInfo != '') {
			foreach ($this->entries as $entry) {
				$senses = $entry['senses'];
				$foundMissingInfo = false;
				if (count($senses) == 0) {
					$foundMissingInfo = true;
				} else {
					foreach ($senses as $sense) {
						switch ($missingInfo) {
							case LexiconConfigObj::DEFINITION:
								$definition = $sense['definition'];
								if (count($definition) == 0) {
									$foundMissingInfo = true;
								} else {
									foreach ($definition as $form) {
										if ($form['value'] == '') {
											$foundMissingInfo = true;
										}
									}
								}
								break;
	
							case LexiconConfigObj::POS:
								if (!array_key_exists('value', $sense['partOfSpeech']) || $sense['partOfSpeech']['value'] == '') {
									$foundMissingInfo = true;
								}
								break;
	
							case LexiconConfigObj::EXAMPLE_SENTENCE:
								$examples = $sense['examples'];
								if (count($examples) == 0) {
									$foundMissingInfo = true;
								} else {
									foreach ($examples as $example) {
										if (!array_key_exists('sentence', $example) || count($example['sentence']) == 0) {
											$foundMissingInfo = true;
										} else {
											foreach ($example['sentence'] as $form) {
												if ($form['value'] == '') {
													$foundMissingInfo = true;
												}
											}
										}
									}
								}
								break;
	
							case LexiconConfigObj::EXAMPLE_TRANSLATION:
								$examples = $sense['examples'];
								if (count($examples) == 0) {
									$foundMissingInfo = true;
								} else {
									foreach ($examples as $example) {
										if (!array_key_exists('translation', $example) || count($example['translation']) == 0) {
											$foundMissingInfo = true;
										} else {
											foreach ($example['translation'] as $form) {
												if ($form['value'] == '') {
													$foundMissingInfo = true;
												}
											}
										}
									}
								}
								break;
							
							default:
								throw new \Exception("Unknown missingInfoType = " . $missingInfo);
						}
						if ($foundMissingInfo) {
							break;
						}
					}
				}
				if ($foundMissingInfo) {
					$entriesToReturn[] = array(
						'id' => $entry['id'],
						'definition' => $this->getDefinition($entry),
						'lexeme' => $this->getLexeme($entry)
					);
				}
			} // end of foreach
			$this->entries = $entriesToReturn;
			$this->count = count($this->entries);
		} else {
			foreach ($this->entries as $entry) {
				$entriesToReturn[] = array(
					'id' => $entry['id'],
					'definition' => $this->getDefinition($entry),
					'lexeme' => $this->getLexeme($entry)
				);
			}
			$this->entries = $entriesToReturn;
		}
	}

	/**
	 * If the $value of $propertyName exists in entries return the entry
	 * @param string $propertyName
	 * @param unknown $value
	 * @return array|boolean $entry or false if not found
	 */
	public function searchEntriesFor($propertyName, $value) {
		foreach ($this->entries as $entry) {
			if ($entry[$propertyName] == $value) {
				return $entry;
			}
		}
		return false;
	}
	
}

?>