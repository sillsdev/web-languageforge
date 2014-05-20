<?php
require_once('e2eTestConfig.php');

// put the test config into place
copy(SFCONFIG . '.fortest', SFCONFIG);

// use commands go here (after the e2eTestConfig)
use models\commands\ProjectCommands;
use models\commands\UserCommands;
use models\rights\Roles;

// start with a fresh database
$db = \models\mapper\MongoStore::connect(SF_DATABASE);
foreach ($db->listCollections() as $collection) { $collection->drop(); }

$constants = json_decode(file_get_contents(TestPath . '/testConstants.json'), true);

//print_r(UserCommands::listUsers());


UserCommands::createUser(array(
								'id' => '',
								'name' => $constants['adminName'],
								'email' => $constants['adminEmail'],
							 	'username' => $constants['adminUsername'],
							 	'password' => $constants['adminPassword'],
								'active' => true,
								'role' => Roles::SYSTEM_ADMIN
						));
//print_r(UserCommands::listUsers());

?>