<?php

namespace Api\Model\Shared\Rights;

class SystemRoles extends RolesBase
{
    const SYSTEM_ADMIN = "system_admin"; // highest possible level
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

        // System Admin
        $rights = [];
        self::grantAllOnDomain($rights, Domain::USERS);
        self::grantAllOnDomain($rights, Domain::PROJECTS);
        self::$_rights[self::SYSTEM_ADMIN] = $rights;
    }

    private static $_rights;
    public static function hasRight($role, $right)
    {
        return self::_hasRight(self::$_rights, $role, $right);
    }
    public static function getRightsArray($role)
    {
        return self::_getRightsArray(self::$_rights, $role);
    }
}
SystemRoles::init();
