<?php

namespace Api\Model\Shared;

use Symfony\Component\Security\Core\Encoder\BCryptPasswordEncoder;

class UserModelWithPassword extends UserModel
{
    /** @var string */
    public $password;

    /**
     * @param string $newPassword
     */
    public function setPassword($newPassword)
    {
        $bcrypt = new BCryptPasswordEncoder(BCRYPT_COST);
        $this->password = $bcrypt->encodePassword($newPassword, null);
    }

    /**
     * @param string $newPassword
     */
    public function changePassword($newPassword)
    {
        $bcrypt = new BCryptPasswordEncoder(BCRYPT_COST);
        $this->password = $bcrypt->encodePassword($newPassword, null);
    }

    /**
     * A utility function to verify if the password in the db matches the given password
     * This is primarily used in tests
     * @param string $passwordToVerify
     * @return bool true if the password matches, false if not
     */
    public function verifyPassword($passwordToVerify)
    {
        $bcrypt = new BCryptPasswordEncoder(BCRYPT_COST);
        return $bcrypt->isPasswordValid($this->password, $passwordToVerify, null);
    }

    /**
     * A utility function to verify if the password in the db exists (non-blank)
     * This is primarily used to determine if an invited user's email is available for signup
     * @return bool true if the password exists, false if not
     */
    public function passwordExists()
    {
        return !empty($this->password);
    }
}
