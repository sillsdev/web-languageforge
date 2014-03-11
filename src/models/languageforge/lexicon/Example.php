<?php

namespace models\languageforge\lexicon;

class Example {

	function __construct() {
		$this->sentence = new MultiText();
		$this->translation = new MultiText();
		$this->authorInfo = new AuthorInfo();
	}

	/**
	 * The id of the example as specified in the LIFT file
	 * @var string
	 */
	public $liftId;

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
