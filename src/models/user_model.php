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
	public $id;
	
	public $userName;
	
	public $email;
	
}
User_model::init(new User_model_MongoMapper());

?>