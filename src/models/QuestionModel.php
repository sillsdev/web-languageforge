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
			static::$_pool[$databaseName] = new QuestionModelMongoMapper($databaseName, 'texts');
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

	public function listQuestions() {
		$questionList = new QuestionListQuestionsModel($this->_mapper->databaseName(), $this->id);
		$questionList->read();
		return $questionList;
	}
	
	public $id;
	
	public $name;
	
	public $content;
	
}

class QuestionListModel extends \libraries\sf\MapperListModel
{

	public function __construct()
	{
		parent::__construct(
			QuestionModelMongoMapper::instance(),
			array('name' => array('$regex' => '')),
			array('name')
		);
	}
	
}

class QuestionTypeaheadModel extends \libraries\sf\MapperListModel
{
	public function __construct($search)
	{
		parent::__construct(
				QuestionModelMongoMapper::instance(),
				array('name' => array('$regex' => $search, '$options' => '-i')),
				array('name')
		);
	}	
	
}

?>