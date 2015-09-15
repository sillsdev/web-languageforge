<?php

namespace Api\Model\Shared\Dto;

use Api\Model\ProjectModel;

class ManageUsersDto
{
    /**
     * @param string $projectId
     * @param string $userId
     * @returns array - the DTO array
     */
    public static function encode($projectId)
    {
        $projectModel = ProjectModel::getById($projectId);

        $list = $projectModel->listUsers();
        $data = array();
        $data['userCount'] = $list->count;
        $data['users'] = $list->entries;
        $data['project'] = array(
            'roles' => $projectModel->getRolesList(),
            'ownerRef' => $projectModel->ownerRef,
            'name' => $projectModel->projectName,
            'appLink' => "/app/{$projectModel->appName}/$projectId/"
        );

        return $data;
    }
}
