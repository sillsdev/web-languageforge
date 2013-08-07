<?php

namespace models\dto;



use models\ProjectModel;


class ActivityListDto
{
	/**
	 * @param string $projectId
	 * @param string $questionId
	 * @return array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$projectModel = new ProjectModel($projectId);
	}
	
}

?>