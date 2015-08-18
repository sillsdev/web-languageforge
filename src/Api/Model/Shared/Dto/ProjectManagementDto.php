<?php

namespace Api\Model\Shared\Dto;

use Api\Model\ProjectModel;

class ProjectManagementDto {

    public static function encode($projectId) {
        $dto = array();
        $project = ProjectModel::getById($projectId);
        $methodPrefix = 'project_management_report_' . $project->appName . '_';
        $reports = array();

        foreach (get_class_methods('\Api\Service\Sf') as $methodName) {
            if (strpos($methodName, $methodPrefix) !== FALSE) {
                $reportId = explode($methodPrefix, $methodName)[1];
                $displayName = ucwords(preg_replace('/([A-Z])/', ' $1', $reportId));
                $reportId = $project->appName . '_' . $reportId;
                array_push($reports, array('id' => $reportId, 'name' => $displayName));
            }
        }

        $dto['reports'] = $reports;

        return $dto;
    }

}
