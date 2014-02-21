<?php

namespace models\lex;

use models\mapper\Id;

class Example {

	function __construct() {
		$this->example = new MultiText();
		$this->translation = new MultiText();
		$this->authorInfo = new AuthorInfo();
	}

	/**
	 * @var MultiText
	 */
	public $example;

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
