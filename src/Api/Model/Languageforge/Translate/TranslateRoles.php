<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\ProjectRoles;

class TranslateRoles extends ProjectRoles
{
    public static function init()
    {
        // Project Member
        $rights = array();
        $rights[] = Domain::PROJECTS + Operation::VIEW;
        self::$_rights[self::CONTRIBUTOR] = $rights;

        // Project Manager (everything an user has... plus the following)
        $rights = self::$_rights[self::CONTRIBUTOR];
        $rights[] = Domain::PROJECTS + Operation::EDIT;
        $rights[] = Domain::USERS + Operation::CREATE;
        $rights[] = Domain::USERS + Operation::EDIT;
        $rights[] = Domain::USERS + Operation::DELETE;
        $rights[] = Domain::USERS + Operation::VIEW;
        self::$_rights[self::MANAGER] = $rights;
    }

    private static $_rights;
    public static function hasRight($role, $right) { return self::_hasRight(self::$_rights, $role, $right); }
    public static function getRightsArray($role) { return self::_getRightsArray(self::$_rights, $role); }
}

TranslateRoles::init();
