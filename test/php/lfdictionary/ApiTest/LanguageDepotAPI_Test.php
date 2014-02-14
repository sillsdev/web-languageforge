<?php

use LanguageDepot\LanguageDepotAPI;
use lfbase\common\DataConnector;
use lfbase\common\DataConnection;
use lfbase\dto\LDAddProjectWithPasswordDTO;

/**
 * Test the LanguageDepotAPI
 * 
 * @author cjh
 */


require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once(SIMPLETEST_PATH . 'autorun.php');

feedTheLoader();

class TestLanguageDepotAPI extends UnitTestCase {
	
	function testAddProject_validInputs_projectCreatedAndReturnsSuccessCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$projId = 'ugudu';
		$projName = 'Ugudu Dictionary';
		$projType = 'dictionary';
		$projLang = 'aba';
		
		// setup environment
		$e->deleteProjectRow($projId);
		$this->assertFalse($e->hasProjectRow($projId));
		
		// API call
		$apiResult = $api->addProject($projName, $projId, $projType, $projLang);
		
		$this->assertTrue($e->hasProjectRow($projId));
		
		$row = $e->getProjectRow($projId);
		$this->assertEqual($row['name'], $projName);
		$this->assertEqual($row['description'], "$projLang-$projType");
		
		$this->assertEqual("200", $apiResult);
		
		// clean up
		$e->deleteProjectRow($projId);
	}	
	
	function testAddProject_invalidInputs_returnsFailCode() {
		$api = new LanguageDepotAPI();
		
		// API call
		$apiResult = $api->addProject("", "345543543545434534343453453", "", "");
		
		$this->assertEqual("500", $apiResult);
	}
	
	function testAddProject_projectIdExists_returnsProjectExistsCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		// setup environment
		$e->deleteProjectRow("p1");
		$this->assertFalse($e->hasProjectRow("p1"));
		
		// API call
		$api->addProject("p1", "p1", "p1", "x", "x");
		
		$this->assertTrue($e->hasProjectRow("p1"));
		
		// second API call
		$apiResult = $api->addProject("p1", "p1", "p1", "x", "x");
		
		// project exists code = 401
		$this->assertEqual("401", $apiResult);
	}
	
	function testAddUser_validInputs_userCreatedAndReturnsSuccessCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$userName = 'joe';
		
		// setup environment
		$e->deleteUserRow($userName);
		$this->assertFalse($e->hasUserRow($userName));
		
		// API call
		$apiResult = $api->addUser($userName, "Joe", "Smith", "12345", "joe@smith.com");
		
		$this->assertTrue($e->hasUserRow($userName));
		
		$row = $e->getUserRow($userName);
		$this->assertEqual($row['login'], $userName);
		$this->assertEqual($row['firstname'], "Joe");
		$this->assertEqual($row['lastname'], "Smith");
		$this->assertEqual($row['mail'], "joe@smith.com");
		
		$this->assertEqual("200", $apiResult);
		
		// clean up
		$e->deleteUserRow($userName);
		
	}
	
	function testAddUser_invalidInputs_returnsFailCode() {
		$api = new LanguageDepotAPI();
		
		// API call
		$apiResult = $api->addUser("", "", "", "", "");
		
		$this->assertEqual("500", $apiResult);
	
	}
	
	function testAddUser_userNameExists_returnsUserExistsCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		// setup environment
		$e->deleteUserRow("u1");
		$this->assertFalse($e->hasUserRow("u1"));
		
		// API call
		$api->addUser("u1", "u1", "u1", "u1", "u1");
		
		$this->assertTrue($e->hasUserRow('u1'));
		
		// second API call
		$apiResult = $api->addUser("u1", "u1", "u1", 'u1', 'u1');
		
		// user exists code = 401
		$this->assertEqual("401", $apiResult);
	}
	
	function testAddUserToProject_userNameDoesNotExist_returnsFailCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$projId = "sampleProject";
		$userName = "thisuserdefinitelydoesntexist";
		$roleId = "5";
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteProjectRow($projId);
		
		$api->addProject("some project", $projId, 'flex', 'lang');
		$this->assertTrue($e->hasProjectRow($projId));
		
		$apiResult = $api->addUserToProject($projId, $userName, $roleId);
		$this->assertEqual("402", $apiResult);
		$this->assertFalse($e->hasMemberRow($userName, $projId));
		
		$e->deleteProjectRow($projId);
	}
	
	function testAddUserToProject_projectIdDoesNotExist_returnsFailCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$projId = "projectdoesntexist";
		$userName = "user1";
		$roleId = "5";
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteUserRow($userName);
		
		$api->addUser($userName,"first", "last", "password", "joe@me.com");
		$this->assertTrue($e->hasUserRow($userName));
		
		$apiResult = $api->addUserToProject($projId, $userName, $roleId);
		$this->assertEqual("402", $apiResult);
		$this->assertFalse($e->hasMemberRow($userName, $projId));
		
		$e->deleteUserRow($userName);
	}
	
	function testAddUserToProject_roleIdDoesNotExist_returnsFailCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$projId = "project1";
		$userName = "user1";
		$roleId = "invalid";
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteUserRow($userName);
		$e->deleteProjectRow($projId);
		
		$api->addUser($userName,"first", "last", "password", "joe@me.com");
		$this->assertTrue($e->hasUserRow($userName));
		$api->addProject("some project", $projId, 'flex', 'lang');
		$this->assertTrue($e->hasProjectRow($projId));
		
		$apiResult = $api->addUserToProject($projId, $userName, $roleId);
		$this->assertEqual("402", $apiResult);
		$this->assertFalse($e->hasMemberRow($userName, $projId));
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteUserRow($userName);
		$e->deleteProjectRow($projId);
	}
	
	function testAddUserToProject_userIsNotMember_userIsMemberAndReturnsSuccessCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$projId = "project1";
		$userName = "user1";
		$roleId = "4"; // role 4 is a contributer
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteUserRow($userName);
		$e->deleteProjectRow($projId);
		
		$api->addUser($userName,"first", "last", "password", "joe@me.com");
		$this->assertTrue($e->hasUserRow($userName));
		$api->addProject("some project", $projId, 'flex', 'lang');
		$this->assertTrue($e->hasProjectRow($projId));
		
		$apiResult = $api->addUserToProject($projId, $userName, $roleId);
		$this->assertEqual("200", $apiResult);
		$this->assertTrue($e->hasMemberRow($userName, $projId));
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteUserRow($userName);
		$e->deleteProjectRow($projId);
	}
	
	function testAddUserToProject_userIsAlreadyMember_returnsSuccessCode() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$projId = "project1";
		$userName = "user1";
		$roleId = "4"; // role 4 is a contributer
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteUserRow($userName);
		$e->deleteProjectRow($projId);
		
		$api->addUser($userName,"first", "last", "password", "joe@me.com");
		$this->assertTrue($e->hasUserRow($userName));
		$api->addProject("some project", $projId, 'flex', 'lang');
		$this->assertTrue($e->hasProjectRow($projId));
		
		$apiResult = $api->addUserToProject($projId, $userName, $roleId);
		$this->assertEqual("200", $apiResult);
		$this->assertTrue($e->hasMemberRow($userName, $projId));
		
		// add as member for the second time
		$apiResult = $api->addUserToProject($projId, $userName, $roleId);
		$this->assertEqual("200", $apiResult);
		
		$e->deleteMemberRow($userName, $projId);
		$e->deleteUserRow($userName);
		$e->deleteProjectRow($projId);
		
	}
	
	function testAddProjectWithPassword_validInputs_projectAndUserCreatedAndUserAddedToProjectReturnsSuccessDTO() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$type = "dictionary";
		$language = "de";
		$roleId = "4"; // role 4 is a contributer
		
		$id = "$language-$type";
		
		$e->deleteRows($id);
		
		$resultDTO = $api->addProjectWithPassword("my sample project", "joe@smith.com", "a new password", $type, $language);
		
		$this->assertTrue($e->hasUserRow($id));
		$this->assertTrue($e->hasProjectRow($id));
		$this->assertTrue($e->hasMemberRow($id, $id));
		
		$resultArr = $resultDTO->encode();
		$this->assertEqual($resultArr['identifier'], $id);
		$this->assertEqual($resultArr['status'], "200");
		
		$e->deleteRows($id);
	}
	
	function testAddProjectWithPassword_invalidEmail_returnsValidationErrorCodeDTO() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$type = "dictionary";
		$language = "de";
		$roleId = "4"; // role 4 is a contributer
		
		$id = "$language-$type";
		
		$e->deleteRows($id);
		
		$resultDTO = $api->addProjectWithPassword("my sample project", "invalidemail", "a new password", $type, $language);
		
		$this->assertFalse($e->hasUserRow($id));
		$this->assertFalse($e->hasProjectRow($id));
		$this->assertFalse($e->hasMemberRow($id, $id));
		
		$resultArr = $resultDTO->encode();
		$this->assertEqual($resultArr['status'], "402");
		
		$e->deleteRows($id);
	}
	function testAddProjectWithPassword_noPassword_returnsValidationErrorCodeDTO() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$type = "dictionary";
		$language = "de";
		$roleId = "4"; // role 4 is a contributer
		
		$id = "$language-$type";
		
		$e->deleteRows($id);
		
		$resultDTO = $api->addProjectWithPassword("my sample project", "joe@me.com", "", $type, $language);
		
		$this->assertFalse($e->hasUserRow($id));
		$this->assertFalse($e->hasProjectRow($id));
		$this->assertFalse($e->hasMemberRow($id, $id));
		
		$resultArr = $resultDTO->encode();
		$this->assertEqual($resultArr['status'], "402");
		
		$e->deleteRows($id);
	}
	function testAddProjectWithPassword_noType_returnsValidationErrorCodeDTO() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$type = "";
		$language = "de";
		$roleId = "4"; // role 4 is a contributer
		
		$id = "$language-$type";
		
		$e->deleteRows($id);
		
		$resultDTO = $api->addProjectWithPassword("my sample project", "joe@me.com", "myPass", $type, $language);
		
		$this->assertFalse($e->hasUserRow($id));
		$this->assertFalse($e->hasProjectRow($id));
		$this->assertFalse($e->hasMemberRow($id, $id));
		
		$resultArr = $resultDTO->encode();
		$this->assertEqual($resultArr['status'], "402");
		
		$e->deleteRows($id);
	}
	
	function testAddProjectWithPassword_projectIdExists_returnsProjectIdExistsCodeDTO() {
		$api = new LanguageDepotAPI();
		$e = new LanguageDepotTestEnvironment();
		
		$type = "dictionary";
		$language = "de";
		$roleId = "4"; // role 4 is a contributer
		
		$id = "$language-$type";
		
		$e->deleteRows($id);
		
		$resultDTO = $api->addProjectWithPassword("my sample project", "joe@smith.com", "a new password", $type, $language);
		
		$this->assertTrue($e->hasUserRow($id));
		$this->assertTrue($e->hasProjectRow($id));
		$this->assertTrue($e->hasMemberRow($id, $id));
		
		$resultArr = $resultDTO->encode();
		$this->assertEqual($resultArr['identifier'], $id);
		$this->assertEqual($resultArr['status'], "200");
		
		// now try and add the same project again
		$resultDTO = $api->addProjectWithPassword("my sample project", "joe@smith.com", "a new password", $type, $language);
		$resultArr = $resultDTO->encode();
		
		// assert project exists status code
		$this->assertEqual($resultArr['status'], "401");
		
		$e->deleteRows($id);
		
	}
}


class LanguageDepotTestEnvironment {
	private $_db;
	
	function __construct() {
		$this->_db = DataConnector::connect('languagedepot');
	}
	
	function getProjectRow($id) {
		$result = $this->_db->execute("SELECT * FROM projects WHERE identifier = '$id'");  	
		return $this->_db->fetch_assoc($result);
	}
	
	function getUserRow($id) {
		$result = $this->_db->execute("SELECT * FROM users WHERE login = '$id'");  	
		return $this->_db->fetch_assoc($result);
	}
	
	function getMemberRow($userId, $projectId) {
		$row = $this->getUserRow($userId);
		$userIdInternal = $row['id'];
		$row = $this->getProjectRow($projectId);
		$projectIdInternal = $row['id'];
		$result = $this->_db->execute("SELECT * FROM members WHERE user_id = '$userIdInternal' AND project_id = '$projectIdInternal'");  	
		return $this->_db->fetch_assoc($result);
	}
	
	function hasProjectRow($id) {
		$rows = $this->getProjectRow($id);
		if (count($rows) > 0) {
			return TRUE;
		}
		return FALSE;
	}
	
	function hasUserRow($id) {
		$rows = $this->getUserRow($id);
		if (count($rows) > 0) {
			return TRUE;
		}
		return FALSE;
	}
	
	function hasMemberRow($userId, $projectId) {
		$rows = $this->getMemberRow($userId, $projectId);
		if (count($rows) > 0) {
			return TRUE;
		}
		return FALSE;
	}
	
	function deleteUserRow($id) {
		$this->_db->execute("DELETE FROM users WHERE login = '$id'");  	
	}
	
	function deleteProjectRow($id) {
		$this->_db->execute("DELETE FROM projects WHERE identifier = '$id'");  	
	}
	
	function deleteMemberRow($userId, $projectId) {
		if ($this->hasMemberRow($userId, $projectId)) {
			$row = $this->getUserRow($userId);
			$userIdInternal = $row['id'];
			$row = $this->getProjectRow($projectId);
			$projectIdInternal = $row['id'];
			$this->_db->execute("DELETE FROM members WHERE user_id = '$userIdInternal' AND project_id = '$projectIdInternal'");  	
		}
	}
	
	function deleteRows($projectId, $userId = '') {
		$userId = (!$userId) ? $projectId : $userId;
		$this->deleteMemberRow($userId, $projectId);
		$this->deleteUserRow($userId);
		$this->deleteProjectRow($projectId);
	}
}

	
/**
 * The Loader is a highly annoying thing which is designed to drive people debugging nuts.
 * In order to reduce the effect, during testing, the Loader can be pre-fed, by
 * giving it all the things which it might want.  That way, whilst debugging, it will not get in
 * the way of a pleasant and productive debug session.
 * 
 * Add to this function any objects which the Loader might want to load in this file
 */
function feedTheLoader() {
	
}
