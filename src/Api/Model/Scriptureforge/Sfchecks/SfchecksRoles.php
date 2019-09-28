<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\Domain;

class SfchecksRoles extends ProjectRoles
{
    // idea: role for an user who can add questions?
    // const QUESTION_CONTRIBUTOR = 'question_contributor';

    public static function getRolesList() {
        return ProjectRoles::getRolesList();
    }

    public static function init()
    {
        // Project Contributor
        $rights = array();
        $rights[] = Domain::PROJECTS + Operation::VIEW;
        $rights[] = Domain::TEXTS + Operation::VIEW;
        $rights[] = Domain::QUESTIONS + Operation::VIEW;
        $rights[] = Domain::ANSWERS + Operation::VIEW;
        $rights[] = Domain::ANSWERS + Operation::VIEW_OWN;
        $rights[] = Domain::ANSWERS + Operation::CREATE;
        $rights[] = Domain::ANSWERS + Operation::EDIT_OWN;
        $rights[] = Domain::ANSWERS + Operation::DELETE_OWN;
        $rights[] = Domain::COMMENTS + Operation::VIEW;
        $rights[] = Domain::COMMENTS + Operation::VIEW_OWN;
        $rights[] = Domain::COMMENTS + Operation::CREATE;
        $rights[] = Domain::COMMENTS + Operation::EDIT_OWN;
        $rights[] = Domain::COMMENTS + Operation::DELETE_OWN;
        self::$_rights[self::CONTRIBUTOR] = $rights;

        // Project Manager (everything an user has... plus the following)
        $rights = self::$_rights[self::CONTRIBUTOR];
        $rights[] = Domain::PROJECTS + Operation::EDIT;
        $rights[] = Domain::TEXTS + Operation::CREATE;
        $rights[] = Domain::TEXTS + Operation::EDIT;
        $rights[] = Domain::TEXTS + Operation::ARCHIVE;
        $rights[] = Domain::QUESTIONS + Operation::CREATE;
        $rights[] = Domain::QUESTIONS + Operation::EDIT;
        $rights[] = Domain::QUESTIONS + Operation::ARCHIVE;
        $rights[] = Domain::ANSWERS + Operation::EDIT;
        $rights[] = Domain::ANSWERS + Operation::DELETE;
        $rights[] = Domain::COMMENTS + Operation::EDIT;
        $rights[] = Domain::COMMENTS + Operation::DELETE;
        $rights[] = Domain::TAGS + Operation::CREATE;
        $rights[] = Domain::TAGS + Operation::EDIT;
        $rights[] = Domain::TAGS + Operation::DELETE;
        $rights[] = Domain::USERS + Operation::CREATE;
        $rights[] = Domain::USERS + Operation::EDIT;
        $rights[] = Domain::USERS + Operation::DELETE;
        $rights[] = Domain::USERS + Operation::VIEW;
        self::grantAllOnDomain($rights, Domain::TEMPLATES);
        self::$_rights[self::MANAGER] = $rights;

        // Tech support (same as manager)
        self::$_rights[self::TECH_SUPPORT] = $rights;
    }

    private static $_rights;
    public static function hasRight($role, $right) { return self::_hasRight(self::$_rights, $role, $right); }
    public static function getRightsArray($role) { return self::_getRightsArray(self::$_rights, $role); }

}
SfchecksRoles::init();
