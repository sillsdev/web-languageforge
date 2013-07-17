<?php

namespace models;

use libraries\sf;

class PasswordModelMongoMapper extends \libraries\sf\MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new PasswordModelMongoMapper(SF_DATABASE, 'users');
		}
		return $instance;
	}
	
}

class PasswordModel extends \libraries\sf\MapperModel
{
	public function __construct($id = NULL)
	{
		parent::__construct(PasswordModelMongoMapper::instance(), $id);
	}
	
	public static function remove($id)
	{
		PasswordModelMongoMapper::instance()->remove($id);
	}

	public $id;
	
	public $password;

	public $remember_code; // Used so we can reset the remember_code after PW change, to force user to re-login
}

?>
