<?php

namespace models;

use models\mapper\Id;
use models\mapper\ArrayItem;

class CommentModel
{

	public function __construct() {
		$this->id = new Id();
		$this->userRef = new Id();
	}
	
	public $id;
	
	public $content;
	
	public $dateCreated;
	
	public $dateEdited;
	
	public $userRef; // TODO This is going to need to be a one way reference type CP 2013-07
			
}

?>