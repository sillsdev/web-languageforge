<?php

namespace models;

use models\UserModelMongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;
use models\mapper\MongoMapper;
use models\mapper\ReferenceList;
use models\rights\Realm;
use models\rights\Roles;


class UserProfileModel extends \models\UserModel
{
	
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
