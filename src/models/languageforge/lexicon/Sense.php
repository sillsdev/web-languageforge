<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class Sense {

	function __construct() {
		$this->definition = new MultiText();
		$this->partOfSpeech = new LexiconFieldWithComments();
		$this->semanticDomain = new LexiconMultiValueFieldWithComments();
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
	 * The id of the sense as specified in the LIFT file
	 * @var string
	 */
	public $liftId;

	/**
	 * @var LexiconFieldWithComments
	 */
	public $partOfSpeech;
	

	/**
	 * @var LexiconMultiValueFieldWithComments
	 */
	public $semanticDomain;

	/**
	 * @var ArrayOf<Example>
	 */
	public $examples;

	/**
	 *
	 * @var AuthorInfo
	 */
	public $authorInfo;

}

?>
