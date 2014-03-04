<?php

namespace models\languageforge\lexicon;

use models\CommentModel;
use models\mapper\MapOf;

class Example {

	function __construct() {
		$this->sentence = new MapOf(
			function($data) {
				return new LexiconFieldWithComments();
			}		
		);
		$this->translation = new MapOf(
			function($data) {
				return new LexiconFieldWithComments();
			}		
		);
		$this->authorInfo = new AuthorInfo();
	}

	/**
	 * @var MapOf<LexiconFieldWithComments>
	 */
	public $sentence;
	
	/**
	 * @var MapOf<LexiconFieldWithComments>
	 */
	public $translation;

	/**
	 * @var AuthorInfo
	 */
	public $authorInfo;

}

?>
