<?php

namespace models;

use models\mapper\Id;

class CommentModelMongoMapper extends \models\mapper\MongoMapper
{
	/**
	 * @var CommentModelMongoMapper[]
	 */
	private static $_pool = array();
	
	/**
	 * @param string $databaseName
	 * @return CommentModelMongoMapper
	 */
	public static function connect($databaseName) {
		if (!isset(static::$_pool[$databaseName])) {
			static::$_pool[$databaseName] = new CommentModelMongoMapper($databaseName, 'questions');
		}
		return static::$_pool[$databaseName];
	}
	
}

class CommentModel extends \models\mapper\MapperModel
{
	public function __construct($databaseName, $id = NULL)
	{
		$this->id = new Id();
		$this->projects = array();
		parent::__construct(CommentModelMongoMapper::connect($databaseName), $id);
	}
	
	public static function remove($databaseName, $id)
	{
		CommentModelMongoMapper::connect($databaseName)->remove($id);
	}

	public $id;
	
	public $comment;
	
	public $dateCreated;
	
	public $dateEdited;
	
	public $userId; // TODO This is going to need to be a one way reference type CP 2013-07
	
	public $textRef; // TODO This is going to need to be a two way reference type CP 2013-07
		
}

?>