<?php

namespace models\languageforge\lexicon;

use models\CommentModel;

use models\mapper\Id;
use models\mapper\ArrayOf;
use models\mapper\MapOf;

class Sense {

	function __construct() {
		$this->definition = new MapOf(
			function($data) {
				return new LexiconFieldWithComments();
			}		
		);
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
	 * @var MapOf<LexiconFieldWithComments>
	 */
	public $definition;
	

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
