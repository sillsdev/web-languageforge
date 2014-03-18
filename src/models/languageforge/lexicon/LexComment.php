<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class LexComment extends LexCommentReply {
	
	/**
	 * 
	 * @var string - value of the LexiconField under comment at the time the comment was written
	 */
	public $regarding;
	
	/**
	 * 
	 * @var int
	 */
	public $score;
	
	/**
	 * 
	 * @var ArrayOf<LexCommentReply>
	 */
	public $replies;
	
	/**
	 * 
	 * @var string - comment status e.g. open, todo, reviewed, resolved
	 */
	public $status;
	
	public function __construct($content = '') {
		$this->replies = new ArrayOf(
			function($data) {
				return new LexCommentReply();
			}
		);
		$this->score = 0;
		parent::__construct($content);
	}
}

?>
