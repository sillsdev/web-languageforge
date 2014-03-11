<?php 
namespace models\languageforge\lexicon;

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
		parent::__construct( self::mapper($projectModel->databaseName()), array(), array('guid', 'lexeme'));
	}
	
	public function read($missingInfo = '') {
		parent::read();
		
		if ($missingInfo != '') {
			// TODO: this is extremely inefficient!  Refactor to use mongo db query or at a minimum just 1 db transaction - cjh 2014-03
			foreach ($this->entries as $index => $e) {
				$entry = new LexEntryModel($this->_mapper, $e['id']);
				$foundMissingInfo = false;
				if (count($entry->senses) == 0) {
					$foundMissingInfo = true;
				} else {
					foreach ($entry->senses as $sense) {
						switch ($missingInfo) {
							case LexiconConfigObj::DEFINITION:
								$definition = $sense->definition;
								if (count($definition) == 0) {
									$foundMissingInfo = true;
								} else {
									foreach ($definition as $form) {
										if ($form->value == '') {
											$foundMissingInfo = true;
										}
									}
								}
								break;
	
							case LexiconConfigObj::POS:
								if ($sense->partOfSpeech->value == '') {
									$foundMissingInfo = true;
								}
								break;
	
							case LexiconConfigObj::EXAMPLE_SENTENCE:
								$examples = $sense->examples;
								if (count($examples) == 0) {
									$foundMissingInfo = true;
								} else {
									foreach ($examples as $example) {
										if (count($example->sentence) == 0) {
											$foundMissingInfo = true;
										} else {
											foreach ($example->sentence as $form) {
												if ($form->value == '') {
													$foundMissingInfo = true;
												}
											}
										}
									}
								}
								break;
	
							case LexiconConfigObj::EXAMPLE_TRANSLATION:
								$examples = $sense->examples;
								if (count($examples) == 0) {
									$foundMissingInfo = true;
								} else {
									foreach ($examples as $example) {
										if (count($example->translation) == 0) {
											$foundMissingInfo = true;
										} else {
											foreach ($example->translation as $form) {
												if ($form->value == '') {
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
				if (!$foundMissingInfo) {
					unset($this->entries[$index]);
				}
			}
			$this->count = count($this->entries);
		}
	}

}

?>