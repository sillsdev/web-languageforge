<?php

namespace models;

use models\rights\Roles;
use models\mapper\Id;
use libraries\Bcrypt;

class UserModelWithPassword extends \models\UserModelBase
{
	public function setPassword($newPassword) {
		$bcrypt = new Bcrypt();
		$this->password = $bcrypt->hash($newPassword);
	}
	
	/**
	 * @var string
	 */
	public $password;
}

?>