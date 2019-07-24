<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Shared\ProjectModel;

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

        $projectRoles = array();
        foreach($projectModel->getRolesList() as $roleKey=>$roleName) {
            $projectRoles[] = array('roleKey'=>$roleKey, 'roleName' => $roleName);
        }

        $list = $projectModel->listUsers();
        $data = array();
        $data['userCount'] = $list->count;
        $data['users'] = $list->entries;
        $data['invitees'] = $projectModel->listInvitees()->entries;
        $data['project'] = array(
            'roles' => $projectRoles,
            'ownerRef' => $projectModel->ownerRef,
            'projectName' => $projectModel->projectName,
            'appLink' => "/app/{$projectModel->appName}/$projectId/"
        );

        return $data;
    }
}
