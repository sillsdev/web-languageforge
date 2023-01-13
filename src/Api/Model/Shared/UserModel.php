<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\ReferenceList;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;

class UserModel extends MapperModel
{
    const GENDER_MALE = "Male";
    const GENDER_FEMALE = "Female";

    /**
     * List of properties accessible by context
     */
    const PUBLIC_ACCESSIBLE = ["username", "name", "email"];
    const USER_PROFILE_ACCESSIBLE = [
        "avatar_color",
        "avatar_shape",
        "avatar_ref",
        "mobile_phone",
        "name",
        "email",
        "username",
        "age",
        "gender",
        "interfaceLanguageCode",
    ];
    const ADMIN_ACCESSIBLE = [
        "username",
        "name",
        "email",
        "role",
        "active",
        "isInvited",
        "avatar_color",
        "avatar_shape",
        "avatar_ref",
        "mobile_phone",
        "name",
        "age",
        "gender",
        "interfaceLanguageCode",
        "languageDepotUsername",
    ];

    public function __construct($id = "")
    {
        $this->id = new Id();
        $this->projects = new ReferenceList();
        $this->siteRole = new MapOf();
        $this->googleOAuthIds = new ArrayOf();
        $this->facebookOAuthIds = new ArrayOf();
        $this->paratextOAuthIds = new ArrayOf();
        $this->paratextAccessToken = new AccessTokenModel();
        $this->validationExpirationDate = new \DateTime();
        $this->resetPasswordExpirationDate = new \DateTime();
        $this->projectsProperties = new MapOf(function () {
            return new ProjectProperties();
        });

        /*
         * We don't need to set 'role' to ReadOnly because we control where it's modified
         * with ADMIN_ACCESSIBLE
         */

        $this->setReadOnlyProp("projects");

        parent::__construct(UserModelMongoMapper::instance(), $id);
    }

    /** @var IdReference */
    public $id;

    /*
     * Site Administration accessible
     */

    /** @var string */
    public $username;

    /** @var string Full Name (this is optional profile information) */
    public $name;

    /** @var string An unconfirmed email address for this user */
    public $emailPending;

    /** @var string */
    public $email;

    /** @var string */
    public $validationKey;

    /** @var \DateTime */
    public $validationExpirationDate;

    /** @var string */
    public $resetPasswordKey;

    /** @var \DateTime */
    public $resetPasswordExpirationDate;

    /** @var string @see Roles Note: this is system role */
    public $role;

    /** @var MapOf<string> */
    public $siteRole;

    /** @var ArrayOf<string> */
    public $googleOAuthIds;

    /** @var ArrayOf<string> */
    public $paratextOAuthIds;

    /** @var ArrayOf<string> */
    public $facebookOAuthIds;

    /** @var string */
    public $languageDepotUsername;

    /** @var boolean */
    public $active;

    /** @var boolean */
    public $isInvited;

    //public $groups;

    /** @var ReferenceList */
    public $projects;

    /** @var AccessTokenModel */
    public $paratextAccessToken;

    /*
     * User Profile accessible
     */

    /** @var string */
    public $avatar_color;

    /** @var string */
    public $avatar_shape;

    /** @var  string */
    public $avatar_ref;

    /** @var string */
    public $mobile_phone;

    /* name (also listed in site administration above) */

    /** @var string */
    public $age;

    /** @var string */
    public $gender;

    /**
     * @var int timestamp, see time()
     */
    public $last_login; // read only field

    /*
     * end of User Profile accessible
     */

    /** @var string */
    public $lastUsedProjectId;

    /** @var string Users preferred interface language code */
    public $interfaceLanguageCode;

    /** @var int */
    public $created_on;

    /**
     * TODO Review. This was added but is not used in favour of language set per user rather than per user per project. IJH 2014-03
     * @var MapOf<ProjectProperties>
     */
    public $projectsProperties;

    /**
     * Use $params to set properties of UserModel
     * @param array<string> $properties to assign
     * @param array $params - user model fields to update
     */
    public function setProperties($properties, $params)
    {
        foreach ($properties as $property) {
            if (array_key_exists($property, $params)) {
                $this->{$property} = $params[$property];
            }
        }
    }

    /**
     * @param string $projectId
     * @return bool
     */
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
     * @return string - projectId
     */
    public function getCurrentProjectId()
    {
        $projectId = "";
        if ($this->lastUsedProjectId) {
            $projectId = $this->lastUsedProjectId;
        } else {
            $projectList = $this->listProjects();
            if (count($projectList->entries) > 0) {
                $projectId = $projectList->entries[0]["id"];
            }
        }
        return $projectId;
    }

    /**
     * Adds the user as a member of $projectId
     * You must call write() on both the user model and the project model!!!
     * @param string $projectId
     */
    public function addProject($projectId)
    {
        //$projectModel = new ProjectModel($projectId);
        $this->projects->_addRef($projectId);
        //$projectModel->users->_addRef($this->id);
    }

    /**
     * Removes the user as a member of $projectId
     * You must call write() on both the user model and the project model!!!
     * @param string $projectId
     */
    public function removeProject($projectId)
    {
        //$projectModel = new ProjectModel($projectId);
        $this->projects->_removeRef($projectId);
        //$projectModel->users->_removeRef($this->id);
    }

    public function listProjects()
    {
        $projectList = new ProjectList_UserModel();
        $projectList->readUserProjects($this->id->asString());

        return $projectList;
    }

    public function read($id)
    {
        parent::read($id);

        if (!$this->avatar_ref) {
            $default_avatar = "anonymoose.png";
            $this->avatar_ref = $default_avatar;
        }
    }

    /**
     * Returns true if the email or username already exists in a user account
     * @param string $emailOrUsername
     * @return bool
     */
    public static function userExists($emailOrUsername)
    {
        $user = new UserModel();
        if (!$user->readByEmail($emailOrUsername)) {
            if (!$user->readByUserName($emailOrUsername)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param string $username
     * @return boolean - true if the username exists, false otherwise
     */
    public function readByUserName($username)
    {
        return $this->readByProperty("username", $username);
    }

    /**
     * @param string $email
     * @return boolean - true if the email exists, false otherwise
     */
    public function readByEmail($email)
    {
        return $this->readByProperty("email", strtolower($email));
    }

    /**
     * @param string $usernameOrEmail
     * @return bool - true if we were successful reading by either username or email
     */
    public function readByUsernameOrEmail($usernameOrEmail)
    {
        if (strpos($usernameOrEmail, "@") !== false) {
            return $this->readByEmail($usernameOrEmail);
        } else {
            return $this->readByUserName($usernameOrEmail);
        }
    }

    /**
     * Returns true if the current user has $right.
     * @param int $right
     * @return bool
     * @throws \Exception
     */
    public function hasRight($right)
    {
        $result = SiteRoles::hasRight($this->siteRole, $right) || SystemRoles::hasRight($this->role, $right);

        return $result;
    }

    /**
     * @return array:
     */
    public function getRightsArray()
    {
        $siteRightsArray = SiteRoles::getRightsArray($this->siteRole);
        $systemRightsArray = SystemRoles::getRightsArray($this->role);
        $mergeArray = array_merge($siteRightsArray, $systemRightsArray);

        return array_values(array_unique($mergeArray));
    }

    /**
     * @param bool $consumeKey - if true the validationKey will be destroyed upon validate()
     * @return boolean
     */
    public function validate($consumeKey = true)
    {
        if ($this->validationKey) {
            $today = new \DateTime();
            $interval = $today->diff($this->validationExpirationDate);

            if ($consumeKey) {
                $this->validationKey = "";
                $this->validationExpirationDate = new \DateTime();
            }

            if ($this->emailPending) {
                $this->email = $this->emailPending;
                $this->emailPending = "";
            }

            $intervalSeconds = $interval->d * 86400 + $interval->h * 3600 + $interval->m * 60 + $interval->s;
            if ($intervalSeconds > 0 && $interval->invert == 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param int $days
     * @return string - validation key
     * @throws \Exception
     */
    public function setValidation($days)
    {
        $this->validationKey = sha1(microtime(true) . mt_rand(10000, 90000));
        $today = new \DateTime();
        $this->validationExpirationDate = $today->add(new \DateInterval("P${days}D"));

        return $this->validationKey;
    }

    /**
     * @param bool $consumeKey - if true the resetPasswordKey will be destroyed upon validate()
     * @return boolean
     */
    public function hasForgottenPassword($consumeKey = true)
    {
        if ($this->resetPasswordKey) {
            $today = new \DateTime();
            $interval = $today->diff($this->resetPasswordExpirationDate);

            if ($consumeKey) {
                $this->resetPasswordKey = "";
                $this->resetPasswordExpirationDate = new \DateTime();
            }

            $intervalSeconds = $interval->d * 86400 + $interval->h * 3600 + $interval->m * 60 + $interval->s;
            if ($intervalSeconds > 0 && $interval->invert == 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param int $days
     * @return string - reset password key
     * @throws \Exception
     */
    public function setForgotPassword($days)
    {
        $this->resetPasswordKey = sha1(microtime(true) . mt_rand(10000, 90000));
        $today = new \DateTime();
        $this->resetPasswordExpirationDate = $today->add(new \DateInterval("P${days}D"));

        return $this->resetPasswordKey;
    }

    /**
     * @param $usernameBase - a string which the username should be based on
     */
    public function setUniqueUsernameFromString($usernameBase)
    {
        if (strpos($usernameBase, "@") !== false) {
            $usernameBase = substr($usernameBase, 0, strpos($usernameBase, "@"));
        }
        $usernameBase = strtolower($usernameBase);
        // remove unwanted characters from username
        $usernameBase = preg_replace('/[-.,;+=_\/"\'# ]+/', "", $usernameBase);
        $usernameBase = rtrim($usernameBase, "0..9");
        $potentialUsername = $usernameBase;
        for ($i = 1; $i < 1000; $i++) {
            $u = new UserModel();
            if (!$u->readByUserName($potentialUsername)) {
                break;
            }
            $potentialUsername = $usernameBase . $i;
        }
        $this->username = $potentialUsername;
    }
}

class ProjectProperties
{
    public function __construct($interfaceLanguageCode = "")
    {
        $this->interfaceLanguageCode = $interfaceLanguageCode;
    }

    /** @var string Users preferred interface language code */
    public $interfaceLanguageCode;
}
