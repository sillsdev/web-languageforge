<?php

namespace models;

use models\mapper\IdReference;

use models\mapper\Id;
use models\mapper\MapOf;

class QuestionModelMongoMapper extends \models\mapper\MongoMapper
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

class QuestionModel extends \models\mapper\MapperModel
{
	public function __construct($projectModel, $id = '') {
		$this->id = new Id();
		$this->textRef = new IdReference();
		$this->answers = new MapOf(
			function() {
				return new AnswerModel();
			}
		);
		
		$databaseName = $projectModel->databaseName();
		parent::__construct(QuestionModelMongoMapper::connect($databaseName), $id);
	}	
	
	// TODO Override read to sort answers and comments by date/time. CP 2013-08
	
	/**
	 * Removes this question from the collection
	 * @param string $databaseName
	 * @param string $id
	 */
	public static function remove($databaseName, $id) {
		$mapper = QuestionModelMongoMapper::connect($databaseName);
		$mapper->remove($id);
	}
	
	/**
	 * Adds / updates an answer to the given question.
	 * @param string $databaseName
	 * @param string $questionId
	 * @param AnswerModel $answer
	 */
	public static function writeAnswer($databaseName, $questionId, $answer) {
		$mapper = QuestionModelMongoMapper::connect($databaseName);
		$id = $mapper->write(
			$answer, 
			$answer->id->asString(), 
			MongoMapper::ID_IN_KEY, 
			$questionId, 
			'answers'
		);
		return $id;
	}
	
	/**
	 * Adds / updates a comment on an answer to the given question.
	 * @param string $databaseName
	 * @param string $questionId
	 * @param string $answerId
	 * @param CommentModel $comment
	 */
	public static function writeComment($databaseName, $questionId, $answerId, $comment) {
		$mapper = QuestionModelMongoMapper::connect($databaseName);
		$id = $mapper->write(
			comment, 
			$comment->id->asString(), 
			MongoMapper::ID_IN_KEY, 
			$questionId, 
			"answers.$answerId.comments"
		);
		return $id;
	}
	
	/**
	 * @var Id
	 */
	public $id;
	
	/**
	 * @var string
	 */
	public $title;
	
	/**
	 * @var string A content description/explanation of the question being asked
	 */
	public $description;
	
	/**
	 * @var \DateTime
	 */
	public $dateCreated;
	
	/**
	 * 
	 * @var \DateTime
	 */
	public $dateEdited;

	/**
	 * @var IdReference - Id of the referring text
	 */
	public $textRef;
	
	/**
	 * @var MapOf<AnswerModel>
	 */
	public $answers;
	
}

class QuestionListModel extends \models\mapper\MapperListModel
{

	public function __construct($projectModel, $textId)
	{
		// TODO Include $textId in the query CP 2013-07
		parent::__construct(
			QuestionModelMongoMapper::connect($projectModel->databaseName()),
			array('title' => array('$regex' => '')),
			array('title')
		);
	}
	
}

?>