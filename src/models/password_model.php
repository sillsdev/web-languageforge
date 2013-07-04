<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class Password_model_MongoMapper extends MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new Password_model_MongoMapper(SF_DATABASE, 'users');
		}
		return $instance;
	}
	
}

class Password_model extends MapperModel
{
	public function __construct($id = NULL)
	{
		parent::__construct(Password_model_MongoMapper::instance(), $id);
	}
	
	public static function remove($id)
	{
		Password_model_MongoMapper::instance()->remove($id);
	}

	public $id;
	
	public $password;

	public $remember_code; // Used so we can reset the remember_code after PW change, to force user to re-login
}

?>