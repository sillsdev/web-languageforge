<?php

use models\UserModel;

use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');


class TestJsonEncoderDecoder extends UnitTestCase {

	function __construct() {
	}
	
	function testEncode_privateProperties_notVisible() {
		// TODO: we need a good real-world test for private properties
		// at the moment I cannot think of which model would have a private property - cjh 2014-01
		/*
		$user = new UserModel();
		$user->name = 'test user';
		$user->active = true;
		
		$this->assertTrue(in_array('password', $user->getPrivateProperties()));
		$data = JsonEncoder::encode($user);
		$this->assertFalse(array_key_exists('password', $data));
		*/
	}
	
	function testDecode_readOnlyProperties_propertiesNotChanged() {
		$user = new UserModel();
		$user->name = 'some user';
		$user->username = "joesmith";
		$user->active = true;
		$dateCreated = $user->dateCreated;
		$data = JsonEncoder::encode($user);
		
		// change some data
		$data['name'] = 'another user'; // this can be changed
		$data['dateCreated'] = '2014-01-10 14:26:29'; // this prop is read-only
		
		$user2 = new UserModel();
		JsonDecoder::decode($user2, $data);

		$this->assertEqual($user->name, 'some user');
		$this->assertEqual($user2->name, 'another user');
		$this->assertEqual($user->username, $user2->username);
		$this->assertEqual($user2->dateCreated->format('Y-m-d'), $dateCreated->format('Y-m-d'));
		
	}
	
	// TODO: more testing is needed for readOnlyProperties
	// I was unsuccessful in showing a failing test of changing DateTime before adding readOnly functionality to JsonDecoder, but I implemented the logic anyway.
	// cjh 2014-01
	
}

?>