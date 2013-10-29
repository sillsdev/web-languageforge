<?php

namespace models;

use models\rights\Roles;
use models\mapper\Id;
use libraries\Bcrypt;

class UserModelWithPassword extends \models\UserModelBase
{
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
	public $password;
}

?>