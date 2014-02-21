<?php

namespace models\lex;

use models\mapper\Id;
use models\mapper\ArrayOf;

class Sense {

	function __construct() {
		$this->definition = new MultiText();
		$this->partOfSpeech = '';
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
	 * @var string
	 */
	public $partOfSpeech;

	/**
	 * @var string
	 */
	public $semanticDomainName;

	/**
	 * @var string
	 */
	public $semanticDomainValue;

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
