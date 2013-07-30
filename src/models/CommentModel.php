<?php

namespace models;

class CommentModel
{
	/**
	 * 
	 * @param Id $id
	 */
	public function __construct()
	{
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