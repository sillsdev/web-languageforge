<?php
use models\PasswordModel;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

require_once TestPath . 'common/MongoTestEnvironment.php';

class TestPasswordModel extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
    }

    public function testChangePassword_PasswordChanged()
    {
        // create  user with a random password
        $e = new MongoTestEnvironment();
        $userId = $e->createUser('test', 'test user', 'user@me.com');
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
}
