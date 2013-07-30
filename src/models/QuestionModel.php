<?php

namespace models;

class QuestionModelMongoMapper extends \models\mapper\MongoMapper
{
	/**
	 * @var QuestionModelMongoMapper[]
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

class QuestionModel extends \models\mapper\MapperModel
{
	public function __construct($projectModel, $id = NULL)
	{
		$this->_projectModel = $projectModel;
		$databaseName = $projectModel->databaseName();
		parent::__construct(QuestionModelMongoMapper::connect($databaseName), $id);
	}	
	
	public $id;
	
	public $title;
	
	/**
	 * 
	 * @var string A content description/explanation of the question being asked
	 */
	public $description;
	
	/**
	 * 
	 * @var \MongoDate
	 */
	public $dateCreated;
	
	/**
	 * 
	 * @var \MongoDate
	 */
	public $dateEdited;
	
	/**
	 * @var array<AnswerModel>
	 */
	public $answers;
	
	/**
	 * 
	 * @var string - Id of the referring text
	 */
	public $textId;
}

class QuestionListModel extends \models\mapper\MapperListModel
{

	public function __construct($projectModel/*, $textId*/)
	{
		// TODO Include $textId in the query CP 2013-07
		parent::__construct(
			QuestionModelMongoMapper::connect($projectModel->databaseName()),
			array('comment' => array('$regex' => '')),
			array('comment')
		);
	}
	
}

?>