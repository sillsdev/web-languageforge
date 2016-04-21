<?php

require_once 'cliConfig.php';

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
 * - className: "fully\name\spaced\className"
 * - methodName: "methodName"
 * - parameters: "parameter array to pass to the method"
 * - isTest: false (default if unspecified)
 */

$className = $jsonInput['className'];
$methodName = $jsonInput['methodName'];
$parameters = $jsonInput['parameters'];
$isTest = false;
if (array_key_exists('isTest', $jsonInput)) {
    $isTest = $jsonInput['isTest'];
}

if ($isTest) {
    define('SF_DATABASE', 'scriptureforge_test');
}
require_once APPPATH . 'config.php';

$output = call_user_func_array("$className::$methodName", $parameters);
print json_encode($output);
