<?php

namespace models\dto;

// Not yet needed:
//use models\ProjectList_UserModel;

use models\ProjectListModel;

use models\ProjectModel;

use models\TextListModel;


class ProjectListDto
{
	/**
	 *
	 * @param string $userId  // NOTE: Not implemented yet! Right now *all* projects are listed regardless of ownership. TODO: Implement this. RM 2013-08
	 * @returns array - the DTO array
	 */
	public static function encode() {
		// Eventually this will need to become:
		//$projectList = new ProjectList_UserModel($userId);
		$projectList = new ProjectListModel();
		$projectList->read();

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
