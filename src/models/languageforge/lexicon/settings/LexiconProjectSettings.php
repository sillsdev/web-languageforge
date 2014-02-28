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
				return new LexiconTask();
			}	
		);
		
		// default values
		$this->tasks['view'] = new LexiconTask();
		$this->tasks['dashboard'] = new LexiconDashboardTask();
		$this->tasks['gatherTexts'] = new LexiconTask();
		$this->tasks['semdom'] = new LexiconSemdomTask();
		$this->tasks['wordlist'] = new LexiconTask();
		$this->tasks['dbe'] = new LexiconTask();
		$this->tasks['addMeanings'] = new LexiconTask();
		$this->tasks['addGrammar'] = new LexiconTask();
		$this->tasks['addExamples'] = new LexiconTask();
		$this->tasks['settings'] = new LexiconTask();
		$this->tasks['review'] = new LexiconTask();
		
		// default values for the entry config
		$this->entry = new LexiconFieldListConfigObj();
		$this->entry->fieldOrder[] = 'lexeme';
		$this->entry->fieldOrder[] = 'senses';

		$this->entry->fields['lexeme'] = new LexiconMultitextConfigObj();
		$this->entry->fields['lexeme']->label = 'Word';
		$this->entry->fields['lexeme']->inputSystems[] = 'en';

		$this->entry->fields['senses'] = new LexiconFieldListConfigObj();
		$this->entry->fields['senses']->fieldOrder[] = 'definition';
		$this->entry->fields['senses']->fieldOrder[] = 'partOfSpeech';
		$this->entry->fields['senses']->fieldOrder[] = 'semanticDomainValue';
		$this->entry->fields['senses']->fieldOrder[] = 'examples';

		$this->entry->fields['senses']->fields['definition'] = new LexiconMultitextConfigObj();
		$this->entry->fields['senses']->fields['definition']->label = 'Meaning';
		$this->entry->fields['senses']->fields['definition']->inputSystems[] = 'en';
		
		$this->entry->fields['senses']->fields['partOfSpeech'] = new LexiconOptionlistConfigObj();
		$this->entry->fields['senses']->fields['partOfSpeech']->label = 'Part of Speech';
		// $this->entry->fields['senses']->fields['partOfSpeech']->values will be populated automatically by the DTO (or perhaps in the client itself)
		
		$this->entry->fields['senses']->fields['semanticDomainValue'] = new LexiconOptionlistConfigObj();
		$this->entry->fields['senses']->fields['semanticDomainValue']->label = 'Semantic Domain';
		// $this->entry->fields['senses']->fields['semanticDomainValue']->values should be populated automatically in the DTO or client

		$this->entry->fields['senses']->fields['examples'] = new LexiconFieldListConfigObj();
		$this->entry->fields['senses']->fields['examples']->fieldOrder[] = 'example';
		$this->entry->fields['senses']->fields['examples']->fieldOrder[] = 'translation';

		$this->entry->fields['senses']->fields['examples']->fields['example'] = new LexiconMultitextConfigObj();
		$this->entry->fields['senses']->fields['examples']->fields['example']->label = 'Example';
		$this->entry->fields['senses']->fields['examples']->fields['example']->inputSystems[] = 'en';
		
		$this->entry->fields['senses']->fields['examples']->fields['translation'] = new LexiconMultitextConfigObj();
		$this->entry->fields['senses']->fields['examples']->fields['translation']->label = 'Translation';
		$this->entry->fields['senses']->fields['examples']->fields['translation']->inputSystems[] = 'en';

	}
}

?>
