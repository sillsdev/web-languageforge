<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\Id;
use Symfony\Component\Security\Core\Encoder\BCryptPasswordEncoder;

class PasswordModel_MongoMapper extends MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new PasswordModel_MongoMapper(SF_DATABASE, 'users');
        }
        return $instance;
    }
}

class PasswordModel extends MapperModel
{
    public function __construct($id = '')
    {
        $this->id = new Id();
        parent::__construct(PasswordModel_MongoMapper::instance(), $id);
    }

    /** @var string */
    public $id;

    /** @var string */
    public $password;

    /** @var boolean */
    public $active;

    public $remember_code; // Used so we can reset the remember_code after PW change, to force user to re-login

    public function changePassword($newPassword)
    {
        $bcrypt = new BCryptPasswordEncoder(BCRYPT_COST);
        $this->password = $bcrypt->encodePassword($newPassword, null);
        $this->remember_code = null;
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
