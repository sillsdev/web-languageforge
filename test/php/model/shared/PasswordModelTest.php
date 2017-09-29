<?php

use Api\Model\Shared\PasswordModel;
use PHPUnit\Framework\TestCase;

class PasswordModelTest extends TestCase
{
    public function testChangePassword_PasswordChanged()
    {
        // create  user with a random password
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('test', 'test user', 'user@me.com');
        $passwordModel = new PasswordModel($userId);
        $someRandomPassword = '$2a$07$zLvg2ereYSEPMGoGttzxrenCCUykFpp6eNTAc.C/NDQPx7WkvUvWa'; // bcrypt for 'blahblah'
        $passwordModel->password = $someRandomPassword;
        $passwordModel->write();

        // change the password to 12345
        $password = '12345';
        $passwordModel->changePassword($password);
        $passwordModel->write();

        // assert that the password was changed correctly
        $passwordModel2 = new PasswordModel($userId);
        $this->assertTrue($passwordModel2->verifyPassword($password));
    }

    public function testPasswordExists_NoPassword_False()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('test', 'test user', 'user@me.com');
        $passwordModel = new PasswordModel($userId);
        $passwordModel->write();

        $this->assertFalse($passwordModel->passwordExists());
    }

    public function testPasswordExists_Password_True()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $userId = $environ->createUser('test', 'test user', 'user@me.com');
        $passwordModel = new PasswordModel($userId);
        $someRandomPassword = '$2a$07$zLvg2ereYSEPMGoGttzxrenCCUykFpp6eNTAc.C/NDQPx7WkvUvWa'; // bcrypt for 'blahblah'
        $passwordModel->password = $someRandomPassword;
        $passwordModel->write();

        $this->assertTrue($passwordModel->passwordExists());

    }
}
