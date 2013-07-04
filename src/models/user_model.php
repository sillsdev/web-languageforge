<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class User_model_MongoMapper extends MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new User_model_MongoMapper(SF_DATABASE, 'users');
		}
		return $instance;
	}
	
}

class User_model extends MapperModel
{
	public function __construct($id = NULL)
	{
		parent::__construct(User_model_MongoMapper::instance(), $id);
	}
	
	public static function remove($id)
	{
		User_model_MongoMapper::instance()->remove($id);
	}

	public $id;
	
	public $name;
	
	public $username;
	
	public $email;
	
	public $avatarRef;
	public $avatarColor;

	public $active;
	
	public $created_on;	
	
	public $last_login; // read only field
	
	public $mobile_phone;
	public $communicate_via_email; // bool
	public $communicate_via_sms; // bool
	public $age;
	public $gender;
	public $city;
	public $preferred_bible_version;
	public $religious_affiliation;
	public $study_group;
	public $feedback_group;
}

class User_list_model extends MapperListModel
{

	public function __construct()
	{
		parent::__construct(
			User_model_MongoMapper::instance(),
			array('email' => array('$regex' => '')),
			array('username', 'email', 'name')
		);
	}
	
}

class User_typeahead_model extends MapperListModel
{
	public function __construct($term)
	{
		parent::__construct(
				User_model_MongoMapper::instance(),
				array('name' => array('$regex' => $term)),
				array('username', 'email', 'name', 'avatarRef')
		);
	}	
	
}

?>