<?php

namespace models;

use models\mapper\Id;

class CommentModel
{

	public function __construct() {
		$this->id = new Id();
		$this->userRef = null; //new Id(); TODO Need to introduce a new Ref class that can be null
	}
	
	public $id;
	
	public $content;
	
	public $dateCreated;
	
	public $dateEdited;
	
	public $userRef; // TODO This is going to need to be a one way reference type CP 2013-07
			
}

?>