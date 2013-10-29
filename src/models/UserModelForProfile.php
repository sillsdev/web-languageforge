<?php

namespace models;

use models\UserModelMongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;
use models\mapper\MongoMapper;
use models\mapper\ReferenceList;
use models\rights\Realm;
use models\rights\Roles;


class UserModelForProfile extends \models\UserModelBase
{
	
	public function read($id) {
		parent::read($id);
		
		// Default Values for User Profile
		if (!$this->avatar_ref) {
			$default_avatar = "/images/avatar/anonymoose.png";
			$this->avatar_ref = $default_avatar;
		}
		if (!$this->communicate_via) {
			$this->communicate_via = self::COMMUNICATE_VIA_EMAIL;
		}
		
	}
	
	/**
	 * @var IdReference
	 */
	public $id;
	
	/**
	 * @var string
	 */
	public $avatar_shape;
	
	/**
	 * @var string
	 */
	public $avatar_color;
	
	public $avatar_ref;

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
	 * @var string
	 */
	public $city;
	/**
	 * @var string
	 */
	public $preferred_bible_version;
	/**
	 * @var string
	 */
	public $religious_affiliation;
	/**
	 * @var string
	 */
	public $study_group;
	/**
	 * @var string
	 */
	public $feedback_group;
}

?>
