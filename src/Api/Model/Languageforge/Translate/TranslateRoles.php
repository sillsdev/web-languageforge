<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\ProjectRoles;

class TranslateRoles extends ProjectRoles
{
    public static function init()
    {
        // Contributor
        $rights = [];
        $rights[] = Domain::PROJECTS + Operation::VIEW;
        $rights[] = Domain::ENTRIES + Operation::VIEW;
        $rights[] = Domain::ENTRIES + Operation::EDIT;
        $rights[] = Domain::ENTRIES + Operation::CREATE;
        $rights[] = Domain::ENTRIES + Operation::DELETE;
        self::$_rights[self::CONTRIBUTOR] = $rights;

        // Manager (everything a Contributor has... plus the following)
        $rights = self::$_rights[self::CONTRIBUTOR];
        $rights[] = Domain::PROJECTS + Operation::EDIT;
        $rights[] = Domain::USERS + Operation::CREATE;
        $rights[] = Domain::USERS + Operation::EDIT;
        $rights[] = Domain::USERS + Operation::DELETE;
        $rights[] = Domain::USERS + Operation::VIEW;
        self::grantAllOnDomain($rights, Domain::ENTRIES);
        self::$_rights[self::MANAGER] = $rights;
    }

    private static $_rights;
    public static function hasRight($role, $right) { return self::_hasRight(self::$_rights, $role, $right); }
    public static function getRightsArray($role) { return self::_getRightsArray(self::$_rights, $role); }
}

TranslateRoles::init();
