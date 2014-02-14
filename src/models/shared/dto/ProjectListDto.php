<?php

namespace models\shared\dto;

use models\ProjectList_UserModel;
use models\ProjectModel;
use models\TextListModel;
use models\UserModel;
use models\rights\Operation;
use models\rights\Domain;
use models\rights\Roles;

class ProjectListDto
{
	/**
	 *
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($userId) {
		
		$user = new UserModel($userId);
		$canListAllProjects = $user->hasRight(Domain::PROJECTS + Operation::VIEW);

		$projectList = new ProjectList_UserModel();
		if ($canListAllProjects) {
			$projectList->readAll();
		} else {
			$projectList->readUserProjects($userId);
		}

		$data = array();
		$data['count'] = $projectList->count;
		$data['entries'] = array();
		foreach ($projectList->entries as $entry) {
			$projectModel = new ProjectModel($entry['id']);
			$textList = new TextListModel($projectModel);
			$textList->read();
			// Just want text count, not whole list
			$entry['textCount'] = $textList->count;
			
			$role = Roles::NONE;
			if (count($projectModel->users->data) > 0) {
				if (isset($projectModel->users->data[$userId]->role)) {
					$role = $projectModel->users->data[$userId]->role;
				}
			}
			$entry['role'] = $role;
				
			$data['entries'][] = $entry;
		}

		return $data;
	}
}

?>
