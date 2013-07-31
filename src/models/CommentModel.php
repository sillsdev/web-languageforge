<?php

namespace models;

use models\mapper\IdReference;

use models\mapper\Id;

class CommentModel
{

	public function __construct() {
		$this->id = new Id();
		$this->userRef = new IdReference();
	}
	
	public $id;
	
	public $content;
	
	public $dateCreated;
	
	public $dateEdited;
	
	public $userRef;
			
}

?>