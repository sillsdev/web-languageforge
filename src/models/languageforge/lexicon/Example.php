<?php

namespace models\languageforge\lexicon;

class Example {

	function __construct() {
		$this->sentence = new MultiText();
		$this->translation = new MultiText();
		$this->authorInfo = new AuthorInfo();
	}

	/**
	 * @var MultiText
	 */
	public $sentence;
	
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
