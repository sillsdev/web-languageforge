<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Library\Shared\UrlHelper;

/**
 * List of projects of which a user is a member
 *
 */
class ProjectList_UserModel extends MapperListModel
{
    public function __construct()
    {
        $this->_site = UrlHelper::getHostname();
        parent::__construct(ProjectModelMongoMapper::instance());
    }

    /** @var string */
    private $_site;

    /**
     * Reads all published projects or all archived projects
     * @param boolean $isArchivedList
     */
    public function readAll($isArchivedList = false)
    {
        if ($isArchivedList) {
            $query = ["siteName" => ['$in' => [$this->_site]], "isArchived" => true];
        } else {
            $query = ["siteName" => ['$in' => [$this->_site]], "isArchived" => ['$ne' => true]];
        }
        $fields = ["projectName", "projectCode", "appName", "siteName", "ownerRef"];

        $this->_mapper->readList($this, $query, $fields);
    }

    /**
     * Reads all published projects in which the given $userId is a member.
     * @param string $userId
     */
    public function readUserProjects($userId)
    {
        $query = [
            "users." . $userId => ['$exists' => true],
            "siteName" => ['$in' => [$this->_site]],
            "isArchived" => ['$ne' => true],
        ];
        $fields = ["projectName", "projectCode", "appName", "siteName", "ownerRef"];

        $this->_mapper->readList($this, $query, $fields);

        // Default sort list on project names
        usort($this->entries, function ($a, $b) {
            $sortOn = "projectName";
            if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
                return strtolower($a[$sortOn]) > strtolower($b[$sortOn]) ? 1 : -1;
            } else {
                return 0;
            }
        });

        return;
    }
}
