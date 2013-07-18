<?php

namespace libraries\api;

class ProjectCommands
{
	
	/**
	 * @param array $projectIds
	 * @return int Total number of projects removed.
	 */
	public static function deleteProjects($projectIds) {
		$count = 0;
		foreach ($projectIds as $projectId) {
			$project = new \models\ProjectModel($projectId);
			$project->remove();
			$count++;
		}
		return $count;
	}
	
}

?>