<?php

namespace models\scriptureforge\rapuma;

use models\shared\rights\ProjectRoles;

class RapumaRoles extends ProjectRoles
{
    public static function init()
    {
        // Project Member
        $rights = array();
        self::$_rights[self::CONTRIBUTOR] = $rights;

        // Project Manager (everything an user has... plus the following)
        $rights = self::$_rights[self::CONTRIBUTOR];
        self::$_rights[self::MANAGER] = $rights;
    }

    private static $_rights;
    public static function hasRight($role, $right) { return self::_hasRight(self::$_rights, $role, $right); }
    public static function getRightsArray($role) { return self::_getRightsArray(self::$_rights, $role); }

}
RapumaRoles::init();
