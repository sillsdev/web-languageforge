<?php

namespace models\languageforge\lexicon;

use models\mapper\IdReference;

class LexCommentReply {
	
	public function __construct($content = '') {
		$this->content = $content;
		$this->id = uniqid();
		$this->dateCreated = new \DateTime();
		$this->dateModified = new \DateTime();
		$this->userRef = new IdReference();
	}
	
	/**
	 * 
	 * @var IdReference
	 */
	public $userRef;
	
	/**
	 * 
	 * @var \DateTime
	 */
	public $dateModified;
	
	/**
	 * 
	 * @var \DateTime
	 */
	public $dateCreated;
	
	/**
	 * 
	 * @var string
	 */
	public $content;
	
	/**
	 * 
	 * @var string
	 */
	public $id;
}

?>
