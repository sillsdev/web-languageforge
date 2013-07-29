<?php

namespace models\dto;

use models\ProjectModel;

use models\QuestionModel;

class QuestionCommentDto
{
	/**
	 * 
	 * @var string
	 */
	public $questionId;
	/**
	 * 
	 * @var string
	 */
	public $projectId;
	
	/**
	 * 
	 * @var string Question title
	 */
	public $title;
	
	/**
	 * 
	 * @var string Question description/explanation content
	 */
	public $content;
	
	/**
	 * 
	 * @var array Array of AnswerDto
	 */
	public $answers;
	
	/**
	 * 
	 * @param string $projectId
	 * @param string $questionId
	 */
	public function __construct($projectId, $questionId) {
		$this->projectId = $projectId;
		$this->questionId = $questionId;
		$this->answers = array();
	}
	
	public function build() {
		$projectModel = new ProjectModel($this->projectId);
		$questionModel = new QuestionModel($projectModel, $this->questionId);
		$questionModel->read();
		$this->title = $questionModel->comment;
		$this->content = $questionModel->description;
		foreach ($questionModel->answers as $answerModel) {
			$answerDto = new AnswerDto($answerModel);
			$answerDto->build();
			array_push($this->answers, $answerDto);
		}
	}
}

?>