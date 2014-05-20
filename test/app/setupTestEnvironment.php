<?php

require_once('e2eTestConfig.php');

rename(SFCONFIG, SFCONFIG . '.live');
rename(SFCONFIG . '.fortest', SFCONFIG);

// use commands
use models\commands\ProjectCommands;


?>