<?php

namespace models;

require_once(APPPATH . '/models/ProjectModel.php');

class QuestionModelMongoMapper extends \libraries\sf\MongoMapper
{
	/**
	 * @var QuestionModelMongoMapper[]
	 */
	private static $_pool = array();
	
	/**
	 * @param string $databaseName
	 * @return QuestionModelMongoMapper
	 */
	public static function connect($databaseName) {
		if (!isset(static::$_pool[$databaseName])) {
			static::$_pool[$databaseName] = new QuestionModelMongoMapper($databaseName, 'questions');
		}
		return static::$_pool[$databaseName];
	}
	
}

class QuestionModel extends \libraries\sf\MapperModel
{
	public function __construct($databaseName, $id = NULL)
	{
		$this->projects = array();
		parent::__construct(QuestionModelMongoMapper::connect($databaseName), $id);
	}
	
	public static function remove($databaseName, $id)
	{
		QuestionModelMongoMapper::connect($databaseName)->remove($id);
	}

	public $id;
	
	public $question;
		
}

class QuestionListModel extends \libraries\sf\MapperListModel
{

	public function __construct($databaseName)
	{
		parent::__construct(
			QuestionModelMongoMapper::connect($databaseName),
			array('question' => array('$regex' => '')),
			array('question')
		);
	}
	
}

?>