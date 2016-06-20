<?php

namespace Api\Model;

use Api\Model\Mapper\Id;
use Api\Model\Mapper\ReferenceList;


class UserModel extends UserModelBase
{

    /**
     * @param string $id
     */
    public function __construct($id = '')
    {
        $this->projects = new ReferenceList();
        $this->setReadOnlyProp('projects');
        parent::__construct($id);
    }

    /**
     *    Removes a user from the collection
     *  Project references to this user are also removed
     */
    public function remove()
    {
        foreach ($this->projects->refs as $id) {
            /* @var Id $id */
            $project = new ProjectModel($id->asString());
            $project->removeUser($this->id->asString());
            $project->write();
        }
        parent::remove();
    }

    public function isMemberOfProject($projectId)
    {
        foreach ($this->projects->refs as $id) {
            /* @var Id $id */
            if ($projectId == $id->asString()) {
                return true;
            }
        }

        return false;
    }

    /**
     *
     * @param string $site
     * @return string - projectId
     */
    public function getCurrentProjectId($site)
    {
        $projectId = '';
        if ($this->lastUsedProjectId) {
            $projectId = $this->lastUsedProjectId;
        } else {
            $projectList = $this->listProjects($site);
            if (count($projectList->entries) > 0) {
                $projectId = $projectList->entries[0]['id'];
            }
        }
        return $projectId;
    }

    /**
     *    Adds the user as a member of $projectId
     *  You must call write() on both the user model and the project model!!!
     * @param string $projectId
     */
    public function addProject($projectId)
    {
        //$projectModel = new ProjectModel($projectId);
        $this->projects->_addRef($projectId);
        //$projectModel->users->_addRef($this->id);
    }

    /**
     *    Removes the user as a member of $projectId
     *  You must call write() on both the user model and the project model!!!
     * @param string $projectId
     */
    public function removeProject($projectId)
    {
        //$projectModel = new ProjectModel($projectId);
        $this->projects->_removeRef($projectId);
        //$projectModel->users->_removeRef($this->id);
    }

    public function listProjects($site)
    {
        $projectList = new ProjectList_UserModel($site);
        $projectList->readUserProjects($this->id->asString());

        return $projectList;
    }

    /**
     * @var ReferenceList
     */
    public $projects;

}

