<?php

namespace models;

require_once(APPPATH . '/models/ProjectModel.php');

class TextModelMongoMapper extends \libraries\sf\MongoMapper
{
	/**
	 * @var TextModelMongoMapper[]
	 */
	private static $_pool = array();
	
	/**
	 * @param string $databaseName
	 * @return TextModelMongoMapper
	 */
	public static function connect($databaseName) {
		if (!isset(static::$_pool[$databaseName])) {
			static::$_pool[$databaseName] = new TextModelMongoMapper($databaseName, 'texts');
		}
		return static::$_pool[$databaseName];
	}
	
}

class TextModel extends \libraries\sf\MapperModel
{
	public function __construct($databaseName, $id = NULL)
	{
		$this->projects = array();
		parent::__construct(TextModelMongoMapper::connect($databaseName), $id);
	}
	
	public static function remove($databaseName, $id)
	{
		TextModelMongoMapper::connect($databaseName)->remove($id);
	}

	public function listQuestions() {
		$questionList = new QuestionListTextsModel($this->_mapper->databaseName(), $this->id);
		$questionList->read();
		return $questionList;
	}
	
	public $id;
	
	public $name;
	
	public $content;
	
}

class TextListModel extends \libraries\sf\MapperListModel
{

	public function __construct($databaseName)
	{
		parent::__construct(
			TextModelMongoMapper::connect($databaseName),
			array('name' => array('$regex' => '')),
			array('name')
		);
	}
	
}

class TextTypeaheadModel extends \libraries\sf\MapperListModel
{
	public function __construct($search)
	{
		parent::__construct(
				TextModelMongoMapper::instance(),
				array('name' => array('$regex' => $search, '$options' => '-i')),
				array('name')
		);
	}	
	
}

?>