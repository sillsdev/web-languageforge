<?php

namespace Api\Model\Shared\Rights;

class ProjectRoles extends RolesBase
{
    const MANAGER = 'project_manager';
    const CONTRIBUTOR = 'contributor';
    const NONE = 'none';
    const TECH_SUPPORT = 'tech_support';

    public static function getRolesList() {
        $roles = array(
            self::MANAGER => "Manager",
            self::CONTRIBUTOR => "Contributor",
            self::TECH_SUPPORT => "Tech Support"
        );
        return $roles;
    }

    public static function isManager($role) {
        return ($role == self::MANAGER || $role == self::TECH_SUPPORT);
    }
}
