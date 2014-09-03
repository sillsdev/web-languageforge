<?php

namespace models;

use libraries\Bcrypt;

class UserModelWithPassword extends \models\UserModelBase
{
    public function setPassword($newPassword)
    {
        $bcrypt = new Bcrypt();
        $this->password = $bcrypt->hash($newPassword);
    }

    /**
     * @var string
     */
    public $password;
}
