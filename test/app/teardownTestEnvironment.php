<?php

require_once('e2eTestConfig.php');

copy(SFCONFIG . '.live', SFCONFIG);
copy(MONGOCONFIG . '.live', MONGOCONFIG);

// use commands
use models\commands\ProjectCommands;


?>