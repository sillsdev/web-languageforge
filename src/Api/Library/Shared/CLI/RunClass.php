<?php

require_once 'cliConfig.php';

(php_sapi_name() == 'cli') or exit('this script must be run on the command-line');

// remove all non-printable characters from the input stream
$jsonInput = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stream_get_contents(STDIN));
$input = json_decode($jsonInput, true);

if (json_last_error() != JSON_ERROR_NONE) {
    print 'JSON Error: ' . json_last_error_msg() . PHP_EOL . 'jsonInput: ' . $jsonInput . PHP_EOL;
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

$className = $input['className'];
$methodName = $input['methodName'];
$parameters = $input['parameters'];
$isTest = false;
if (array_key_exists('isTest', $input)) {
    $isTest = $input['isTest'];
}

if ($isTest) {
    define('DATABASE', 'scriptureforge_test');
}
require_once APPPATH . 'config.php';

$output = call_user_func_array("$className::$methodName", $parameters);
print json_encode($output);
