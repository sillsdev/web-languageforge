<?php

namespace models;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\Id;
use libraries\Bcrypt;

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

    public function changePassword($newPassword)
    {
        $bcrypt = new Bcrypt();
        $this->password = $bcrypt->hash($newPassword);
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
        $bcrypt = new Bcrypt();
        return $bcrypt->verify($passwordToVerify, $this->password);
    }

    public $id;

    public $password;

    public $remember_code; // Used so we can reset the remember_code after PW change, to force user to re-login
}
