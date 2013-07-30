<?php

namespace models\dto;

use models\ProjectModel;

use models\QuestionModel;

class QuestionCommentDto
{
	/**
	 * 
	 * @param string $projectId
	 * @param string $questionId
	 */
	public static function encode($projectId, $questionId) {
		$data = array();
		
		$projectModel = new ProjectModel($this->projectId);
		$questionModel = new QuestionModel($projectModel, $this->questionId);
		$data['projectid'] = $this->projectId;
		$data['questionid'] = $this->questionId;
		$data['title'] = $questionModel->title;
		$data['description'] = $questionModel->description;
		$data['answers'] = array();
		
		foreach ($questionModel->answers as $answerModel) {
			$answer = array();
			$answer['userid'] = $answerModel->userId;
			$answer['date_created'] = $answerModel->dateCreated;
			$answer['date_edited'] = $answerModel->dateEdited;
			$answer['answer'] = $answerModel->content;
			$answer['score'] = $answerModel->score;
			
			$userModel = new UserModel($answerModel->userId);
			$answer['avatar_ref'] = $userModel->avatar_ref;
			$answer['by'] = $userModel->username;
		
			$answer['comments'] = array();
			foreach ($answerModel->comments as $commentModel) {
				$comment = array();
				$comment['userid'] = $commentModel->userId;
				$comment['date_created'] = $commentModel->dateCreated;
				$comment['date_edited'] = $commentModel->dateEdited;
				$comment['content'] = $commentModel->content;
				$comment['text_ref'] = $commentModel->textRef;
				
				$userModel = new UserModel($commentModel->userId);
				$comment['by'] = $userModel->username;
				
				array_push($answer['comments'], $comment);
			}
			
			array_push($data['answers'], $answer);
		}
		
		return $data;
	}
}

?>