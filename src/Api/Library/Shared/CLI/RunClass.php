<?php

require_once('cliConfig.php');

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

$input = stream_get_contents(STDIN);
$jsonInput = json_decode($input, true);

if (json_last_error() != JSON_ERROR_NONE) {
    print json_last_error_msg() . "\n";
    exit(1);
}

/*
 * We expect the json input to have the following structure
 *
 * - className: "fully namespaced classname"
 * - methodName: "methodName"
 * - parameters: "named parameters to pass to the method"
 */

$className = $jsonInput['className'];
$methodName = $jsonInput['methodName'];
$parameters = $jsonInput['parameters'];

$output = call_user_func_array("$className::$methodName", $parameters);
print json_encode($output);
