<?php

namespace Api\Model\Shared;

use Api\Model\Scriptureforge\Sfchecks\SfchecksUserProfile;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MapOf;

class UserProfileModel extends UserModel
{
    public function __construct($id = '')
    {
        $this->id = new Id();
        $this->projectsProperties = new MapOf(function () {
            return new ProjectProperties();
        });
        $this->projectUserProfiles = new MapOf(function () {
            return new SfchecksUserProfile();
        });
        parent::__construct($id);
    }

    /** @var string */
    public $avatar_shape;

    /** @var string */
    public $avatar_color;

    /** @var int */
    public $created_on;

    public $last_login; // read only field

    /** @var string */
    public $mobile_phone;

    /** @var string */
    public $age;

    /** @var string */
    public $gender;

    /** @var string Users preferred interface language code */
    public $interfaceLanguageCode;

    /**
     * TODO Review. This was added but is not used in favour of language set per user rather than per user per project. IJH 2014-03
     * @var MapOf<ProjectProperties>
     */
    public $projectsProperties;

    /**
     * TODO Deprecate. Migrate to $this->projectsProperties[<projectId>]->sfchecksUserProfile IJH 2014-03
     * @var MapOf<SfchecksUserProfile>
     */
    public $projectUserProfiles;
}

class ProjectProperties
{
    public function __construct($interfaceLanguageCode = '')
    {
        $this->interfaceLanguageCode = $interfaceLanguageCode;
    }

    /** @var string Users preferred interface language code */
    public $interfaceLanguageCode;

    /** @var SfchecksUserProfile*/
    public $sfchecksUserProfile;
}
