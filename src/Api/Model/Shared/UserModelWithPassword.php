<?php

namespace Api\Model\Shared;

use Symfony\Component\Security\Core\Encoder\BCryptPasswordEncoder;

class UserModelWithPassword extends UserModel
{
    public function setPassword($newPassword)
    {
        $bcrypt = new BCryptPasswordEncoder(BCRYPT_COST);
        $this->password = $bcrypt->encodePassword($newPassword, null);
    }

    /** @var string */
    public $password;
}
