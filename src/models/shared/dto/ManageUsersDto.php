<?php

namespace models\shared\dto;

use models\ProjectModel;

class ManageUsersDto
{
    /**
     * @param string $projectId
     * @param string $userId
     * @returns array - the DTO array
     */
    public static function encode($projectId)
    {
        $projectModel = new ProjectModel($projectId);

        $list = $projectModel->listUsers();
        $data = array();
        $data['userCount'] = $list->count;
        $data['users'] = $list->entries;

        return $data;
    }
}
