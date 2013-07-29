<?php

namespace models;

class QuestionModel extends CommentModel
{
	public function __construct($projectModel, $id = NULL) {
		parent::__construct($projectModel, $id);
		$this->answers = array();
	}
	
	/**
	 * @var array<AnswerModel>
	 */
	public $answers;
	
	/**
	 * 
	 * @var string A content description/explanation of the question being asked
	 */
	public $description;
	
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
			CommentModelMongoMapper::connect($projectModel->databaseName()),
			array('comment' => array('$regex' => '')),
			array('comment')
		);
	}
	
}

?>