<?php

require_once('e2eTestConfig.php');

copy(SFCONFIG . '.live', SFCONFIG);

// use commands
use models\commands\ProjectCommands;


?>