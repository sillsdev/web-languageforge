<?php

namespace models\shared\dto;

use libraries\shared\Website;

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
	public static function encode($userId, $site) {
		
		$user = new UserModel($userId);
		$canListAllProjects = $user->hasRight(Domain::PROJECTS + Operation::VIEW);

		$projectList = new ProjectList_UserModel($site);
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
			$role = Roles::NONE;
			if (count($projectModel->users) > 0) {
				if (isset($projectModel->users[$userId]) && isset($projectModel->users[$userId]->role)) {
					$role = $projectModel->users[$userId]->role;
				}
			}
			$entry['role'] = $role;
				
			$data['entries'][] = $entry;
		}
		
		// Default sort list on project names
		usort($data['entries'], function ($a, $b) {
			$sortOn = 'projectname';
			if (array_key_exists($sortOn, $a) &&
				array_key_exists($sortOn, $b)){
				return (strtolower($a[$sortOn]) > strtolower($b[$sortOn])) ? 1 : -1;
			} else {
				return 0;
			}
		});
		return $data;
	}
}

?>
