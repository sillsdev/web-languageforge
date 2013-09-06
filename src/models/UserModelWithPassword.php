<?php

namespace models;

use models\mapper\Id;
use libraries\Bcrypt;


class UserModelWithPassword extends \models\mapper\MapperModel
{
	public function __construct()
	{
		$this->id = new Id();
		parent::__construct(UserModelMongoMapper::instance());
	}

	public function encryptPassword() {
		$bcrypt = new Bcrypt();
		$this->password = $bcrypt->hash($this->password);
	}
	
	
	/**
	 * @var IdReference
	 */
	public $id;
	
	/**
	 * @var string
	 */
	public $name;
	
	/**
	 * 
	 * @var bool
	 */
	public $active;
	
	/**
	 * @var string
	 */
	public $username;
	
	/**
	 * @var string
	 */
	public $email;
	
	/**
	 * @var string
	 */
	public $password;
	
}

?>