<?php

namespace models\languageforge\lexicon;

use models\mapper\ObjectForEncoding;

class Example extends ObjectForEncoding {

	function __construct($liftId = '') {
		$this->setPrivateProp('liftId');
		$this->setReadOnlyProp('authorInfo');
		$this->liftId = $liftId;
		$this->sentence = new MultiText();
		$this->translation = new MultiText();
		$this->authorInfo = new AuthorInfo();
		$this->id = uniqid();
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
	
	/**
	 * 
	 * @var string
	 */
	public $id;

}

?>
