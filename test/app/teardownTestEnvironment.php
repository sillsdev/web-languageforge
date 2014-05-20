<?php

require_once('e2eTestConfig.php');

rename(SFCONFIG, SFCONFIG . '.fortest');
rename(SFCONFIG . '.live', SFCONFIG);

// use commands
use models\commands\ProjectCommands;


?>