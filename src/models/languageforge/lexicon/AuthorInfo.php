<?php

namespace models\lex;

/**
 * This class contains author information for the lex entry element and it sub-elements
 */
class AuthorInfo {

	public function __construct() {
		$this->createdByIdRef = "";
		$this->createdDate = 0;
		$this->modifiedByIdRef = "";
		$this->modifiedDate = 0;
	}
	
	/**
	 * user's Id as string
	 * @var String
	 */
	public $createdByIdRef;
	
	/**
	 *	datetime as timestamp
	 * @var int
	 */
	public $createdDate;
	
	/**
	 * user's Id as string
	 * @var String
	 */
	public $modifiedByIdRef;
	
	/**
	 * datetime as timestamp
	 * @var int
	 */
	public $modifiedDate;
	
}

?>
