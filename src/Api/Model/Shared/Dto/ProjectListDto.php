<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Shared\ProjectList_UserModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;

class ProjectListDto
{
    /**
     * @param string $userId
     * @param boolean $isArchivedList - set true to list archived projects
     * @return array - the DTO array
     */
    public static function encode($userId, $isArchivedList = false)
    {
        $user = new UserModel($userId);
        $canListAllProjects = $user->hasRight(Domain::PROJECTS + Operation::VIEW);

        $projectList = new ProjectList_UserModel("languageforge.org");
        if ($canListAllProjects) {
            $projectList->readAll($isArchivedList);
        } else {
            $projectList->readUserProjects($userId);
        }

        $data = [];
        $data["entries"] = [];
        $count = 0;
        foreach ($projectList->entries as $entry) {
            $project = new ProjectModel($entry["id"]);
            $role = ProjectRoles::NONE;
            if (count($project->users) > 0) {
                if (isset($project->users[$userId]) && isset($project->users[$userId]->role)) {
                    $role = $project->users[$userId]->role;
                }
            }
            $entry["role"] = $role;
            if (array_key_exists("ownerRef", $entry) and $entry["ownerRef"]) {
                $entry["ownerId"] = strval($entry["ownerRef"]);
            } else {
                $entry["ownerId"] = "";
                // for legacy projects that don't have an owner
            }
            unset($entry["ownerRef"]);
            $entry["dateModified"] = $project->dateModified->asDateTimeInterface()->format(\DateTime::RFC2822);
            $data["entries"][] = $entry;
            $count++;
        }
        $data["count"] = $count;

        // Default sort list on project names
        usort($data["entries"], function ($a, $b) {
            $sortOn = "projectName";
            if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
                return strtolower($a[$sortOn]) > strtolower($b[$sortOn]) ? 1 : -1;
            } else {
                return 0;
            }
        });

        return $data;
    }
}
