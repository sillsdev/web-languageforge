<?php

namespace Api\Model;

use Api\Library\Shared\Website;
use Api\Model\Mapper\MongoEncoder;
use Api\Model\Mapper\MongoMapper;
use Api\Model\Mapper\ReferenceList;

require_once APPPATH . 'Api/Model/ProjectModel.php';

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
            $project = new ProjectModel($id->asString());
            $project->removeUser($this->id->asString());
            $project->write();
        }
        parent::remove();
    }

    public function isMemberOfProject($projectId)
    {
        foreach ($this->projects->refs as $id) {
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
    public function getDefaultProjectId($site)
    {
        // note: this method could be refactored to use an actual "default project" value on the user model
        $projectList = $this->listProjects($site);
        if (count($projectList->entries) > 0) {
            return $projectList->entries[0]['id'];
        } else {
            return '';
        }
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

class UserListModel extends \Api\Model\Mapper\MapperListModel
{

    public function __construct()
    {
        parent::__construct(
            UserModelMongoMapper::instance(),
            array('username' => array('$regex' => '')),
            array('username', 'email', 'name', 'avatar_ref', 'role')
        );
    }

}

class UserTypeaheadModel extends \Api\Model\Mapper\MapperListModel
{
    /**
     * @param MongoMapper $term
     * @param string or array $projectIdOrIds
     * @param Website $website
     * @param bool $include
     */
    public function __construct($term, $projectIdOrIds = '', $website, $include = false)
    {
        $query = array('$or' => array(
                        array('name' => array('$regex' => $term, '$options' => '-i')),
                        array('username' => array('$regex' => $term, '$options' => '-i')),
                        array('email' => array('$regex' => $term, '$options' => '-i')),
                ));
        if (!empty($projectIdOrIds)) {
            // Allow $projectIdOrIds to be either an array or a single ID
            if (is_array($projectIdOrIds)) {
                $idsForQuery = $projectIdOrIds;
            } else {
                $idsForQuery = array($projectIdOrIds);
            }
            // If passed string IDs, convert to MongoID objects
            $idsForQuery = array_map(function ($id) {
                if (is_string($id)) {
                    return MongoMapper::mongoID($id);
                } else {
                    return $id;
                }
            }, $idsForQuery);
            $inOrNotIn = $include ? '$in' : '$nin';
            $query['projects'] = array($inOrNotIn => $idsForQuery);
            //error_log("Query: " . print_r($query, true));
        }
        // Filter for only users on the current site
        $encodedDomain = $website->domain;
        MongoEncoder::encodeDollarDot($encodedDomain);
        $query['siteRole.'.$encodedDomain] = array('$exists' => true);
        parent::__construct(
                UserModelMongoMapper::instance(),
                $query,
                array('username', 'email', 'name', 'avatarRef')
        );
        // If we were called with a project filter that excluded certain users, also
        // return a list of specifically which users were excluded. Which happens to
        // be another typeahead search with the same query term, but *including* only
        // the ones matching this project.
        if ($projectIdOrIds && !$include) {
            $this->excludedUsers = new UserTypeaheadModel($term, $projectIdOrIds, $website, true);
            $this->excludedUsers->read();
        }
        //echo("Result: " . print_r($this, true));
    }
}
