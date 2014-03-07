<?php

namespace models\languageforge\lexicon\settings;



use models\languageforge\lexicon\InputSystem;

use models\mapper\MapOf;

class LexiconProjectSettings {

	/**
	 * 
	 * @var MapOf<LexiconTask>
	 */
	public $tasks;
	
	/**
	 * 
	 * @var LexiconFieldConfigObj
	 */
	public $entry;
	
	function __construct() {
		$this->tasks = new MapOf(
			function($data) {
				switch ($data['type']) {
					case LexiconTask::DASHBOARD:
						return new LexiconDashboardTask();
					case LexiconTask::SEMDOM:
						return new LexiconSemdomTask();
					default:
						return new LexiconTask();
				}
			}	
		);
		
		// default values
		$this->tasks[LexiconTask::VIEW] = new LexiconTask();
		$this->tasks[LexiconTask::DASHBOARD] = new LexiconDashboardTask();
		$this->tasks[LexiconTask::GATHERTEXTS] = new LexiconTask();
		$this->tasks[LexiconTask::SEMDOM] = new LexiconSemdomTask();
		$this->tasks[LexiconTask::WORDLIST] = new LexiconTask();
		$this->tasks[LexiconTask::DBE] = new LexiconTask();
		$this->tasks[LexiconTask::ADDMEANINGS] = new LexiconTask();
		$this->tasks[LexiconTask::ADDGRAMMAR] = new LexiconTask();
		$this->tasks[LexiconTask::ADDEXAMPLES] = new LexiconTask();
		$this->tasks[LexiconTask::REVIEW] = new LexiconTask();
		$this->tasks[LexiconTask::IMPORTEXPORT] = new LexiconTask();
		$this->tasks[LexiconTask::SETTINGS] = new LexiconTask();
		
		// default values for the entry config
		$this->entry = new LexiconFieldListConfigObj();
		$this->entry->fieldOrder[] = LexiconConfigObj::LEXEME;
		$this->entry->fieldOrder[] = LexiconConfigObj::SENSES_LIST;

		$this->entry->fields[LexiconConfigObj::LEXEME] = new LexiconMultitextConfigObj();
		$this->entry->fields[LexiconConfigObj::LEXEME]->label = 'Word';
		$this->entry->fields[LexiconConfigObj::LEXEME]->visible = true;
		$this->entry->fields[LexiconConfigObj::LEXEME]->inputSystems[] = 'en';

		$this->entry->fields[LexiconConfigObj::SENSES_LIST] = new LexiconFieldListConfigObj();
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::DEFINITION;
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::POS;
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SEMDOM;
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::EXAMPLES_LIST;

		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION] = new LexiconMultitextConfigObj();
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->label = 'Meaning';
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->visible = true;
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->inputSystems[] = 'en';
		
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::POS] = new LexiconOptionlistConfigObj();
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::POS]->label = 'Part of Speech';
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::POS]->visible = true;
		// $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::POS]->values will be populated automatically by the DTO (or perhaps in the client itself)
		
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMDOM] = new LexiconOptionlistConfigObj();
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMDOM]->label = 'Semantic Domain';
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMDOM]->visible = true;
		// $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMDOM]->values should be populated automatically in the DTO or client

		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST] = new LexiconFieldListConfigObj();
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fieldOrder[] = LexiconConfigObj::EXAMPLE;
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fieldOrder[] = LexiconConfigObj::TRANSLATION;

		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE] = new LexiconMultitextConfigObj();
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE]->label = 'Example';
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE]->visible = true;
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE]->inputSystems[] = 'en';
		
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::TRANSLATION] = new LexiconMultitextConfigObj();
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::TRANSLATION]->label = 'Translation';
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::TRANSLATION]->visible = true;
		$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::TRANSLATION]->inputSystems[] = 'en';

	}
}

?>
