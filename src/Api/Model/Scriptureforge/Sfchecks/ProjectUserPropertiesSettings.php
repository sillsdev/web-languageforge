<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;

class ProjectUserPropertiesSettings
{
    const PROPERTY_CITY = 'city';
    const PROPERTY_PREFERRED_BIBLE_VERSION = 'preferredBibleVersion';
    const PROPERTY_RELIGIOUS_AFFILIATION = 'religiousAffiliation';
    const PROPERTY_STUDY_GROUP = 'studyGroup';
    const PROPERTY_FEEDBACK_GROUP = 'feedbackGroup';

    public function __construct()
    {
        $this->userProfilePickLists = new MapOf(function () {
            return new PickList();
        });
        $this->userProfilePropertiesEnabled = new ArrayOf();
    }

    /** @var MapOf<PickList> */
    public $userProfilePickLists;

    /** @var ArrayOf<string> Array of keys */
    public $userProfilePropertiesEnabled;

    public function ensurePickListsExist()
    {
        $this->ensurePickListExists(self::PROPERTY_CITY, 'Location');
        $this->ensurePickListExists(self::PROPERTY_PREFERRED_BIBLE_VERSION, 'Preferred Bible Version');
        $this->ensurePickListExists(self::PROPERTY_RELIGIOUS_AFFILIATION, 'Religious Affiliation');
        $this->ensurePickListExists(self::PROPERTY_STUDY_GROUP, 'Study Group');
        $this->ensurePickListExists(self::PROPERTY_FEEDBACK_GROUP, 'Feedback Group');
    }

    private function ensurePickListExists($key, $name)
    {
        if (!isset($this->userProfilePickLists[$key])) {
            $this->userProfilePickLists[$key] = new PickList($name);
        }
    }

    public static function definition()
    {
        static $definition = null;
        if ($definition == null) {
            $definition = array(
                self::PROPERTY_CITY => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                self::PROPERTY_PREFERRED_BIBLE_VERSION => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                self::PROPERTY_RELIGIOUS_AFFILIATION => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                self::PROPERTY_STUDY_GROUP => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                self::PROPERTY_FEEDBACK_GROUP => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST)
            );
        }
        return $definition;
    }
}

class ProjectUserPropertyDefinition
{
    const TYPE_PICK_LIST = 'pick_list';

    public function __construct($type)
    {
        $this->_type = $type;
    }

    private $_type;
}
