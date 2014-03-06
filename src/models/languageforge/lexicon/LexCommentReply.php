<?php

namespace models\languageforge\lexicon;

class LexCommentReply {
	
	public function __construct($content = '') {
		$this->content = $content;
	}
	
	public $userRef;
	
	public $dateModified;
	
	public $dateCreated;
	
	public $content;
}

?>
