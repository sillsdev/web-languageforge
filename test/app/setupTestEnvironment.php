<?php


require_once('e2eTestConfig.php');

copy(SFCONFIG . '.fortest', SFCONFIG);

// use commands
use models\commands\ProjectCommands;
use models\commands\UserCommands;
use models\rights\Roles;

UserCommands::createUser(array(
								'id' => '',
								'name' => 'admin',
							 	'username' => 'admin',
							 	'password' => '1234',
								'active' => true,
								'role' => Roles::SYSTEM_ADMIN
						));

?>