<?php

namespace models\languageforge\lexicon;

use models\CommentModel;

use models\mapper\ArrayOf;

use models\mapper\Id;

class Example {

	function __construct() {
		$this->sentence = new MultiText();
		$this->sentenceComments = new ArrayOf(
			function($data) {
				return new CommentModel();
			}
		);
		$this->translation = new MultiText();
		$this->authorInfo = new AuthorInfo();
	}

	/**
	 * @var MultiText
	 */
	public $sentence;
	
	/**
	 * 
	 * @var ArrayOf<CommentModel>
	 */
	public $sentenceComments;

	/**
	 * @var MultiText
	 */
	public $translation;

	/**
	 * @var AuthorInfo
	 */
	public $authorInfo;

}

?>
