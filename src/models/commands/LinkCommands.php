<?php

namespace models\commands;

class LinkCommands {
	/**
	 * 
	 * @param ProjectModel $project
	 * @param UserModel $user
	 */
	static function LinkUserAndProject($project, $user) {
		$project->addUser($user->id->asString());
		$user->addProject($project->id->asString());
		$project->write();
		$user->write();
	}
	
	/**
	 * 
	 * @param ProjectModel $project
	 * @param UserModel $user
	 */
	static function UnlinkUserAndProject($project, $user) {
		$project->removeUser($user->id->asString());
		$user->removeProject($project->id->asString());
		$project->write();
		$user->write();
	}
	
}


?>