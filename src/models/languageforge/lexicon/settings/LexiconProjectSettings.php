<?php

namespace models\languageforge\lexicon\settings;



class Sample {

	function __construct() {
		$this->definition = new MultiText();
		$this->definitionComments = new ArrayOf(
			function($data) {
				return new CommentModel();
			}
		);
	}

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
