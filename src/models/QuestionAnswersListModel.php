<?php
namespace models;

use models\mapper\MongoMapper;

require_once 'QuestionModel.php';

class QuestionAnswersListModel extends \models\mapper\MapperListModel
{
	public function __construct($projectModel, $textId) {
		parent::__construct(
			QuestionModelMongoMapper::connect($projectModel->databaseName()),
			array('description' => array('$regex' => ''), 'textRef' => MongoMapper::mongoID($textId)),
			array('title', 'description', 'answers', 'isArchived'),
			array('dateCreated' => -1)
		);
	}

}
