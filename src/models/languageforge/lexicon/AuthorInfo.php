<?php

namespace models\languageforge\lexicon;

use models\mapper\IdReference;

/**
 * This class contains author information for the lex entry element and it sub-elements
 */
class AuthorInfo {

	public function __construct() {
		$this->createdByIdRef = new IdReference();
		$this->createdDate = 0;
		$this->modifiedByIdRef = new IdReference();
		$this->modifiedDate = 0;
	}
	
	/**
	 * user's Id as string
	 * @var IdReference
	 */
	public $createdByIdRef;
	
	/**
	 *	datetime as timestamp
	 * @var int
	 */
	public $createdDate;
	
	/**
	 * user's Id as string
	 * @var IdReference
	 */
	public $modifiedByIdRef;
	
	/**
	 * datetime as timestamp
	 * @var int
	 */
	public $modifiedDate;
	
}

?>
