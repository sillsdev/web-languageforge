<?php

namespace Api\Model\Shared\Rights;

use Api\Model\Shared\Mapper\MapOf;

class SiteRoles extends RolesBase
{
    const SITE_MANAGER = "site_manager"; // highest possible level for site: various management responsibilities like creating projects
    const PROJECT_CREATOR = "project_creator"; // permission to create a project
    const USER = "user";
    const NONE = "none";

    public static function init()
    {
        self::$_rights = [];

        // User
        $rights = [];
        $rights[] = Domain::USERS + Operation::EDIT_OWN;
        $rights[] = Domain::USERS + Operation::VIEW_OWN;
        $rights[] = Domain::PROJECTS + Operation::VIEW_OWN;
        // Should users be able to delete their own user accounts? Probably,
        // but not via the listview -- so we should NOT grant DELETE_OWN here.
        //$rights[] = Domain::USERS + Operation::DELETE_OWN;
        self::$_rights[self::USER] = $rights;

        // Project Creator (User plus ability to create/delete own projects)
        // Note: will use ProjectModel::isOwner() to determine
        // ARCHIVE and DELETE of "OWN" projects
        $rights = self::$_rights[self::USER];
        $rights[] = Domain::PROJECTS + Operation::CREATE;
        self::$_rights[self::PROJECT_CREATOR] = $rights;

        // Site Manager (Project creator plus all rights on projects)
        $rights = self::$_rights[self::PROJECT_CREATOR];
        self::grantAllOnDomain($rights, Domain::PROJECTS);
        self::$_rights[self::SITE_MANAGER] = $rights;
    }

    private static $_rights;

    /**
     *
     * @param MapOf $roleMap
     * @return array
     */
    public static function getRightsArray($roleMap)
    {
        if ($roleMap->offsetExists("languageforge.org")) {
            return self::_getRightsArray(self::$_rights, $roleMap["languageforge.org"]);
        }

        return [];
    }

    /**
     *
     * @param  MapOf      $roleMap
     * @param  int        $right
     * @throws \Exception
     * @return bool
     */
    public static function hasRight($roleMap, $right)
    {
        if ($roleMap->offsetExists("languageforge.org")) {
            return self::_hasRight(self::$_rights, $roleMap["languageforge.org"], $right);
        }

        return false;
    }
}
SiteRoles::init();
