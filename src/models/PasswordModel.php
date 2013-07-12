<?php

namespace models;

use libraries\sf\MongoMapper;
use libraries\sf\MapperModel;

require_once(APPPATH . '/models/ProjectModel.php');

class PasswordModel_MongoMapper extends MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new PasswordModel_MongoMapper(SF_DATABASE, 'users');
		}
		return $instance;
	}
	
}

class PasswordModel extends MapperModel
{
	public function __construct($id = NULL)
	{
		parent::__construct(PasswordModel_MongoMapper::instance(), $id);
	}
	
	public static function remove($id)
	{
		PasswordModel_MongoMapper::instance()->remove($id);
	}

	public $id;
	
	public $password;

	public $remember_code; // Used so we can reset the remember_code after PW change, to force user to re-login
}

?>