<?php

namespace libraries\api;

class LinkCommands {
	/**
	 * 
	 * @param ProjectModel $project
	 * @param UserModel $user
	 */
	static function LinkUserAndProject($project, $user) {
		$project->addUser($user->id);
		$user->addProject($project->id);
		$project->write();
		$user->write();
	}
	
	/**
	 * 
	 * @param ProjectModel $project
	 * @param UserModel $user
	 */
	static function UnlinkUserAndProject($project, $user) {
		$project->removeUser($user->id);
		$user->removeProject($project->id);
		$project->write();
		$user->write();
	}
	
	/**
	 * 
	 * @param ProjectModel $project
	 * @param string $textId
	 */
	static function LinkProjectAndText($project, $textId) {
		$project->addText($textId);
		$project->write();
	}
	
	/**
	 * 
	 * @param ProjectModel $project
	 * @param string $textId
	 */
	static function UnlinkProjectAndText($project, $textId) {
		$project->RemoveText($textId);
		$project->write();
	}
	
	/**
	 * 
	 * @param TextModel $text
	 * @param string $questionId
	 */
	static function LinkTextAndQuestion($text, $questionId) {
		$text->addQuestion($questionId);
		$text->write();
	}
	
	/**
	 * 
	 * @param TextModel $text
	 * @param string $questionId
	 */
	static function UnLinkTextAndQuestion($text, $questionId) {
		$text->removeQuestion($questionId);
		$text->write();
	}
}


?>