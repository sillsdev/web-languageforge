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
	
}


?>