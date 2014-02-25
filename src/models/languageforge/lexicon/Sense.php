<?php

namespace models\languageforge\lexicon;

use models\CommentModel;

use models\mapper\Id;
use models\mapper\ArrayOf;

class Sense {

	function __construct() {
		$this->definition = new MultiText();
		$this->definitionComments = new ArrayOf(
			function($data) {
				return new CommentModel();
			}
		);
		$this->partOfSpeech = '';
		$this->partOfSpeechComments = new ArrayOf(
			function($data) {
				return new CommentModel();
			}
		);
		$this->semanticDomain = new ArrayOf(
			function($data) {
				return '';	
			}
		);
		$this->examples = new ArrayOf(
			function($data) {
				return new Example();
			}
		);
		$this->authorInfo = new AuthorInfo();
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

	/**
	 * @var string
	 */
	public $partOfSpeech;
	
	/**
	 * 
	 * @var ArrayOf<CommentModel>
	 */
	public $partOfSpeechComments;

	/**
	 * @var ArrayOf<string>
	 */
	public $semanticDomain;

	/**
	 * @var ArrayOf ArrayOf<Example>
	 */
	public $examples;

	/**
	 *
	 * @var AuthorInfo
	 */
	public $authorInfo;

}

?>
