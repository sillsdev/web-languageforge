<?php

use libraries\shared\AuthHelper;
use models\UserModel;
use models\UserModelWithPassword;
use models\mapper\MapOf;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class MockIonAuth {
	// use empty username or password to make login fail
	public function login($username, $password) {
		return ! empty($username) && ! empty($password);
	}
	public function logout() {
		return true;
	}
	public function messages() {
		return '';
	}
	public function errors() {
		return '';
	}
}

class MockSession {
	private $_data;
	
	public function __construct() {
		$this->_data = new MapOf();
		$this->_data['referer_url'] = '';
	}
	
	public function set_userdata($key, $value) {
		return $this->_data[$key] = $value;
	}
	public function userdata($key) {
		return $this->_data[$key];
	}
	public function unset_userdata($key) {
		return true;
	}
	public function set_flashdata($key, $value) {
		return true;
	}
}

class MockAuthController {
	public $ion_auth;
	public $session;
	
	public function __construct() {
		$this->ion_auth = new MockIonAuth();
		$this->session = new MockSession();
	}
}

class MockAuthHelper extends AuthHelper {
	// override redirect so it doesn't redirect during testing
	public static function redirect($website, $uri = '', $method = 'location', $http_response_code = 302) {}
}

class TestAuthHelper extends UnitTestCase {

	function testLogin_NoUser_Fails() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$username = '';
		$password = '';
		
		$controller = new MockAuthController();
		$auth = new MockAuthHelper($controller->ion_auth, $controller->session);
		$result = $auth->login($e->website, $username, $password);
		
		$this->assertEqual($result, AuthHelper::LOGIN_FAIL);
	}
	
	function testLogin_NoPassword_FailUnauthorized() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$username = 'testUsername';
		$password = 'testPassword';
		$userId = $e->createUser($username, 'test user','test@example.com');
 		$e->website->domain = 'default.local';
		
		$controller = new MockAuthController();
		$controller->session->set_userdata('user_id', $userId);
		
		$auth = new MockAuthHelper($controller->ion_auth, $controller->session);
		$result = $auth->login($e->website, $username, $password);
		
		$this->assertEqual($result, AuthHelper::LOGIN_FAIL_USER_UNAUTHORIZED);
	}
	
	function testLogin_Password_Success() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$username = 'testUsername';
		$password = 'testPassword';
		$userId = $e->createUser($username, 'test user','test@example.com');
		
		$controller = new MockAuthController();
		$controller->session->set_userdata('user_id', $userId);
		
		$auth = new MockAuthHelper($controller->ion_auth, $controller->session);
		$result = $auth->login($e->website, $username, $password);
		
		$this->assertEqual($result, AuthHelper::LOGIN_SUCCESS);
	}
	
}

?>
