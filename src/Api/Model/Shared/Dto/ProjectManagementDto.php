<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Shared\ProjectModel;

class ProjectManagementDto
{
    public static function encode($projectId)
    {
        $dto = [];
        $project = ProjectModel::getById($projectId);
        $methodPrefix = "project_management_report_" . $project->appName . "_";
        $reports = [];

        foreach (get_class_methods("\Api\Service\Sf") as $methodName) {
            if (strpos($methodName, $methodPrefix) !== false) {
                $reportId = explode($methodPrefix, $methodName)[1];
                $displayName = ucwords(preg_replace("/([A-Z])/", ' $1', $reportId));
                $reportId = $project->appName . "_" . $reportId;
                array_push($reports, ["id" => $reportId, "name" => $displayName]);
            }
        }

        $dto["reports"] = $reports;

        return $dto;
    }
}
