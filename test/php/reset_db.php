<?php

use models\rights\ProjectRoles;

use models\AnswerModel;

use models\QuestionListModel;

use models\mapper\MongoStore;
use models\ProjectModel;
use models\QuestionModel;

require_once('LiveConfig.php');
require_once(SimpleTestPath . 'autorun.php');


require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/UserModel.php");
require_once(SourcePath . "models/QuestionModel.php");



class TestResetDb extends UnitTestCase {

	function testResetDb() {
		$m = new MongoClient();
		$db = $m->scriptureforge;
		$drop_old = true;
		
		// will be refactored once we have roles working
		$group_data = array(
			array(
				"name" => "admin",
				"description" => "Administrators"
			),
			array(
				"name" => "users",
				"description" => "Normal Users"
			),
		);
	
		$groups_coll = $db->groups;
		if ($drop_old) {
			$groups_coll->drop();
		}
		$groups_coll->batchInsert($group_data);
	
		$admin_group = $groups_coll->findOne(array("name" => "admin"));
		$users_group = $groups_coll->findOne(array("name" => "users"));
		$admin_id = $admin_group["_id"];
		$users_id = $users_group["_id"];
	
		$users_data = array(array(
			"username" => "admin",
			"name" => "admin",
			"role" => 'system_admin',
			// Default password is "password"; both of the below are hashes of that password
			//"password" => "59beecdf7fc966e2f17fd8f65a4a9aeb09d4a3d4", // If using SHA1
			"password" => '$2a$07$SeBknntpZror9uyftVopmu61qg0ms8Qv1yV6FG.kQOSM.9QhmTo36', // If using bcrypt
			"email" => "admin@admin.com",
			"active" => true,
			"groups" => array( $admin_id, $users_id ),
			"first_name" => "Admin",
			"last_name" => "istrator",
			"created_on" => null,
			"activation_code" => null,
			"forgotten_password_code" => null,
			"forgotten_password_time" => null,
			"remember_code" => null,
			"salt" => null,
			"last_login" => null,
			"company" => "Achme",
			"phone" => "111-111-1111"
		));
	
		$users_coll = $db->users;
		if ($drop_old) {
			$users_coll->drop();
		}
		$users_coll->batchInsert($users_data);
		
		$userList = new \models\UserListModel();
		$userList->read();
		$userId = $userList->entries[0]['id'];
		
		if ($drop_old) {
			$db->projects->drop();
		}
		$project = new ProjectModel();
		$project->projectName = "jamaican project";
		$project->addUser($userId, ProjectRoles::MANAGER);
		$project->write();
		
		$project2 = new ProjectModel();
		$project2->projectName = "thai project";
		$project2->addUser($userId, ProjectRoles::MANAGER);
		$project2->write();
	
		echo "it worked!";
		
	}

}

?>
