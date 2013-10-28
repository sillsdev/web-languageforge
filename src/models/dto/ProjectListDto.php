<?php

namespace models\dto;

use models\ProjectList_UserModel;
use models\ProjectModel;
use models\TextListModel;
use models\UserModel;
use models\rights\Operation;
use models\rights\Domain;

class ProjectListDto
{
	/**
	 *
	 * @param string $userId  // NOTE: Not implemented yet! Right now *all* projects are listed regardless of ownership. TODO: Implement this. RM 2013-08
	 * @returns array - the DTO array
	 */
	public static function encode($userId) {
		
		$user = new UserModel($userId);
		$canListAllProjects = $user->hasRight(Domain::PROJECTS + Operation::VIEW_OTHER);

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

			$data['entries'][] = $entry;
		}

		return $data;
	}
}

?>
