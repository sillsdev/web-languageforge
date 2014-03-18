<?php

namespace models\languageforge\lexicon;

class LexCommentReply {
	
	public function __construct($content = '') {
		$this->content = $content;
		$this->id = uniqid();
		$this->dateCreated = new \DateTime();
		$this->dateModified = new \DateTime();
	}
	
	public $userRef;
	
	public $dateModified;
	
	public $dateCreated;
	
	public $content;
	
	public $id;
}

?>
