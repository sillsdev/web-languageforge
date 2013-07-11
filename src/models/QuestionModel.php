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
	public function __construct($projectModel, $id = NULL)
	{
		parent::__construct(QuestionModelMongoMapper::connect($projectModel->databaseName()), $id);
	}
	
	public static function remove($databaseName, $id)
	{
		QuestionModelMongoMapper::connect($databaseName)->remove($id);
	}

	public $id;
	
	public $question;
	
	public $answers;
		
}

class QuestionListModel extends \libraries\sf\MapperListModel
{

	public function __construct($projectModel)
	{
		parent::__construct(
			QuestionModelMongoMapper::connect($projectModel->databaseName()),
			array('question' => array('$regex' => '')),
			array('question')
		);
	}
	
}

?>