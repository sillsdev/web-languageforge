<?php

namespace Api\Model;

use Api\Library\Bcrypt;

class UserModelWithPassword extends UserModelBase
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
