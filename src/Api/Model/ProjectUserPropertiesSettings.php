<?php
namespace Api\Model;

use Api\Model\Mapper\MapOf;
use Api\Model\Mapper\ArrayOf;

class ProjectUserPropertyDefinition
{
    const TYPE_PICK_LIST = 'pick_list';

    public function __construct($type)
    {
        $this->_type = $type;
    }

    private $_type;
}

class ProjectUserPropertiesSettings
{
    const PROPERTY_CITY                    = 'city';
    const PROPERTY_PREFERRED_BIBLE_VERSION = 'preferredBibleVersion';
    const PROPERTY_RELIGIOUS_AFFILIATION   = 'religiousAffiliation';
    const PROPERTY_STUDY_GROUP             = 'studyGroup';
    const PROPERTY_FEEDBACK_GROUP          = 'feedbackGroup';

    public function __construct()
    {
        $this->userProfilePickLists = new MapOf(function ($data) {
            return new PickList();
        });
        $this->userProfilePropertiesEnabled = new ArrayOf();
    }

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
                PROPERTY_CITY => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                PROPERTY_PREFERRED_BIBLE_VERSION => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                PROPERTY_RELIGIOUS_AFFILIATION => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                PROPERTY_STUDY_GROUP => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST),
                PROPERTY_FEEDBACK_GROUP => new ProjectUserPropertyDefinition(ProjectUserPropertyDefinition::TYPE_PICK_LIST)
            );
        }
        return $definition;
    }

    /**
     * @var MapOf MapOf<PickList>
     */
    public $userProfilePickLists;

    /**
     * Array of keys
     * @var ArrayOf ArrayOf<string>
     */
    public $userProfilePropertiesEnabled;

}
