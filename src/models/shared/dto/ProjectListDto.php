<?php

namespace models\shared\dto;

use models\shared\rights\Domain;
use models\shared\rights\Operation;
use models\shared\rights\ProjectRoles;
use models\ProjectList_UserModel;
use models\ProjectModel;
use models\UserModel;

class ProjectListDto
{
    /**
     * @param string $userId
     * @param Website $website
     * @param boolean $isArchivedList - set true to list archived projects
     * @return array - the DTO array
     */
    public static function encode($userId, $website, $isArchivedList = false)
    {
        $user = new UserModel($userId);
        $canListAllProjects = $user->hasRight(Domain::PROJECTS + Operation::VIEW, $website);

        $projectList = new ProjectList_UserModel($website->domain);
        if ($canListAllProjects) {
            $projectList->readAll($isArchivedList);
        } else {
            $projectList->readUserProjects($userId);
        }

        $data = array();
        $data['entries'] = array();
        $count = 0;
        foreach ($projectList->entries as $entry) {
            $project = new ProjectModel($entry['id']);
            $role = ProjectRoles::NONE;
            if (count($project->users) > 0) {
                if (isset($project->users[$userId]) && isset($project->users[$userId]->role)) {
                    $role = $project->users[$userId]->role;
                }
            }
            $entry['role'] = $role;
            $entry['dateModified'] = $project->dateModified->format(\DateTime::RFC2822);
            $data['entries'][] = $entry;
            $count++;
        }
        $data['count'] = $count;

        // Default sort list on project names
        usort($data['entries'], function ($a, $b) {
            $sortOn = 'projectName';
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
