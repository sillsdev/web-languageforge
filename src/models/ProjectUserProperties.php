<?php
namespace models;

use models\mapper\MapOf;

class ProjectUserPropertyDefinition {
	
	const TYPE_PICK_LIST = 'pick_list';
	
	public function __construct($type) {
		$this->_type = $type;
	}
	
	private $_type;
}

class ProjectUserProperties
{
	const PROPERTY_CITY                    = 'city';
	const PROPERTY_PREFERRED_BIBLE_VERSION = 'preferredBibleVersion';
	const PROPERTY_RELIGIOUS_AFFILIATION   = 'religiousAffliation';
	const PROPERTY_STUDY_GROUP             = 'studyGroup';
	const PROPERTY_FEEDBACK_GROUP          = 'feedbackGroup';
	
	public function __construct() {
		$this->userProfilePickLists = new MapOf(function($data) {
			return new PickList();
		});
	}
	
	public static function definition() {
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