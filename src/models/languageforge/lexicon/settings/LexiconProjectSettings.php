<?php

namespace models\languageforge\lexicon\settings;



use models\mapper\MapOf;

class LexiconProjectSettings {

	function __construct() {
		$this->viewTaskSettings = new LexiconTask();
		$this->dashboardTaskSettings = new LexiconDashboardTask();
		$this->gatherTextsTaskSettings = new LexiconTask();
		$this->semdomTaskSettings = new LexiconSemdomTask();
		$this->dbeTaskSettings = new LexiconTask();
		$this->addMeaningsTaskSettings = new LexiconTask();
		$this->addGrammarTaskSettings = new LexiconTask();
		$this->addExamplesTaskSettings = new LexiconTask();
		$this->settingsTaskSettings = new LexiconTask();
		$this->reviewTaskSettings = new LexiconTask();
		
	}
	
	public $viewTaskSettings;
	public $dashboardTaskSettings;
	public $gatherTextsTaskSettings;
	public $semdomTaskSettings;
	public $wordlistTaskSettings;
	public $dbeTaskSettings;
	public $addMeaningsTaskSettings;
	public $addGrammarTaskSettings;
	public $addExamplesTaskSettings;
	public $settingsTaskSettings;
	public $reviewTaskSettings;
	public $entrySettings;
	
	

	/**
	 * @var MultiText
	 */
	public $definition;
	
	/**
	 * 
	 * @var ArrayOf<CommentModel>
	 */
	public $definitionComments;


}

?>
