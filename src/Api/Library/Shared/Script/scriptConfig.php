<?php

$appPath = realpath(__DIR__ . "/../../../..");
$rootPath = dirname($appPath);

require_once $appPath . "/vendor/autoload.php";
require_once $appPath . "/config.php";

define("TestPath", $rootPath . "/test/");
define("APPPATH", $appPath . "/");
