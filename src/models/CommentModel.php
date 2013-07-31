<?php

namespace models;

use models\mapper\Id;

class CommentModel
{

	public function __construct() {
		$this->id = new Id();
		$this->projects = array();
		parent::__construct(CommentModelMongoMapper::connect($databaseName), $id);
	}
	
	public static function remove($databaseName, $id) {
		// TODO: determine that id is of class id
	}

	public $id;
	
	public $content;
	
	public $dateCreated;
	
	public $dateEdited;
	
	public $userId; // TODO This is going to need to be a one way reference type CP 2013-07
	
	public $textRef; // TODO This is going to need to be a two way reference type CP 2013-07
		
}

?>