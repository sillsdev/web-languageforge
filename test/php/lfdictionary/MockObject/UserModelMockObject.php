<?php
class UserModelMockObject {

	public function id() {
		return TestEnvironment::USER_ID;
	}

	public function getUserName() {
		return "name";
	}
	
	
	public function getUserRole() {
		return "role";
	}
}

?>