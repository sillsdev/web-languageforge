<?php

namespace models\languageforge\lexicon;

use models\mapper\IdReference;

/**
 * This class contains author information for the lex entry element and it sub-elements
 */
class AuthorInfo {

	public function __construct() {
		$this->createdByUserRef = new IdReference();
		$this->createdDate = new \DateTime();
		$this->modifiedByUserRef = new IdReference();
		$this->modifiedDate = new \DateTime();
	}
	
	/**
	 * user's Id as string
	 * @var IdReference
	 */
	public $createdByUserRef;
	
	/**
	 *	datetime
	 * @var DateTime
	 */
	public $createdDate;
	
	/**
	 * user's Id as string
	 * @var IdReference
	 */
	public $modifiedByUserRef;
	
	/**
	 * datetime
	 * @var DateTime
	 */
	public $modifiedDate;
	
}

?>
