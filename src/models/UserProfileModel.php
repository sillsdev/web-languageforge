<?php

namespace models;

use models\UserModelMongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;
use models\mapper\MapOf;
use models\mapper\MongoMapper;
use models\mapper\ReferenceList;

use models\shared\rights\ProjectRoles;

class UserProfileModel extends \models\UserModel {
	
	public function __construct($id = '') {
		$this->id = new Id();
		$this->projectsProperties = new MapOf(function($data) {
			return new ProjectProperties();
		});
		$this->projectUserProfiles = new MapOf(function($data) {
			return new SfchecksUserProfile();
		});
		parent::__construct($id);
	}
		
	/**
	 * @var string
	 */
	public $avatar_shape;
	
	/**
	 * @var string
	 */
	public $avatar_color;
	
	/**
	 * @var int
	 */
	public $created_on;	
	
	public $last_login; // read only field
	
	/**
	 * @var string
	 */
	public $mobile_phone;
	
	/**
	 * @var string
	 */
	public $age;
	
	/**
	 * @var string
	 */
	public $gender;
	
	/**
	 * Users preferred interface language code
	 * @var string
	 */
	public $interfaceLanguageCode;
	
	/**
	 * TODO Review. This was added but is not used in favour of language set per user rather than per user per project. IJH 2014-03
	 * @var MapOf <UserProjectProperties>
	 */
	public $projectsProperties;
	
	/**
	 * TODO Deprecate. Migrate to $this->projectsProperties[<projectId>]->sfchecksUserProfile IJH 2014-03
	 * @var MapOf <SfchecksUserProfile>
	 */
	public $projectUserProfiles;
	
}

class ProjectProperties {
	
	public function __construct($interfaceLanguageCode = '') {
		$this->interfaceLanguageCode = $interfaceLanguageCode;
	}
	
	/**
	 * Users preferred interface language code
	 * @var string
	 */
	public $interfaceLanguageCode;
	
	/**
	 * 
	 * @var SfchecksUserProfile
	 */
	public $sfchecksUserProfile;
	
}

class SfchecksUserProfile {

	/**
	 * @var string
	 */
	public $city;
	
	/**
	 * @var string
	 */
	public $preferredBibleVersion;
	
	/**
	 * @var string
	 */
	public $religiousAffiliation;
	
	/**
	 * @var string
	 */
	public $studyGroup;
	
	/**
	 * @var string
	 */
	public $feedbackGroup;
	
}

?>
