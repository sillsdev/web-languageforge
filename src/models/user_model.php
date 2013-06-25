<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class User_model_MongoMapper extends MongoMapper
{
	function __construct()
	{ 
		parent::__construct('scriptureforge', 'users');
	}
	
}

class User_model extends MapperModel
{
	protected static $_mapper;
	
	public $id;
	
	public $username;
	
	public $email;
	
}
User_model::init(new User_model_MongoMapper());

class User_list_model extends MapperListModel
{
	protected static $_mapper;

	function __construct()
	{
		parent::__construct(array('email' => array('$regex' => '')), array('username', 'email'));
	}
}
User_list_model::init(new User_model_MongoMapper());

?>