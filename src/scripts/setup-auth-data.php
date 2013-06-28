#!/usr/bin/php -q
<?php
	function usage ($cmdname) {
		echo "Usage: $cmdname dbname [REALLY_DROP_OLD]\n";
		echo "  dbname = Name of database to populate with admin account\n";
		echo "  If REALLY_DROP_OLD (spelled EXACTLY like that)\n";
		echo "  is the second parameter, the database will be\n";
		echo "  emptied before populating it, so the end result\n";
		echo "  will be a brand-new, fresh database with nothing but\n";
		echo "  the admin account inside it.\n";
	}

	$cmd = array_shift($argv);
	if (count($argv) == 0) {
		usage($cmd);
		exit(2);
	}
	foreach ($argv as $arg) {
		if ($arg == "--help") {
			usage($cmd);
			exit(2);
		}
	}
	$dbname = $argv[0];
	$drop_old = (count($argv) >= 2 and $argv[1] == "REALLY_DROP_OLD");
	echo "I will " . ($drop_old ? "drop, then repopulate" : "repopulate (without dropping)") . " the users and groups from the database named $dbname\n";
	//exit(1); // If you want to do a dry run, exit here

	$m = new MongoClient();
	$db = $m->$dbname;

	$group_data = [
		array(
			"name" => "admin",
			"description" => "Administrators"
		),
		array(
			"name" => "users",
			"description" => "Normal Users"
		),
	];

	$groups_coll = $db->groups;
	if ($drop_old) {
		$groups_coll->drop();
	}
	$groups_coll->batchInsert($group_data);

	$admin_group = $groups_coll->findOne(array("name" => "admin"));
	$users_group = $groups_coll->findOne(array("name" => "users"));
	$admin_id = $admin_group["_id"];
	$users_id = $users_group["_id"];

	$users_data = [array(
		"username" => "admin",
		// Default password is "password"; both of the below are hashes of that password
		//"password" => "59beecdf7fc966e2f17fd8f65a4a9aeb09d4a3d4", // If using SHA1
		"password" => '$2a$07$SeBknntpZror9uyftVopmu61qg0ms8Qv1yV6FG.kQOSM.9QhmTo36', // If using bcrypt
		"email" => "admin@admin.com",
		"active" => 1,
		"groups" => [ $admin_id, $users_id ],
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
	)];

	$users_coll = $db->users;
	if ($drop_old) {
		$users_coll->drop();
	}
	$users_coll->batchInsert($users_data);

	echo "Looks like it all worked!\n";
	exit(0);
?>
