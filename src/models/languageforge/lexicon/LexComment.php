<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class LexComment extends LexCommentReply {
	
	public $regarding;
	
	public $score;
	
	public $subcomments;
	
	public $status;
	
	public function __construct() {
		$this->subcomments = new ArrayOf(
			function($data) {
				return new LexCommentReply();
			}
		);
	}
}

?>
