<?php

use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

$rootPath = realpath(__DIR__ . "/../..") . DIRECTORY_SEPARATOR;

// Fake app path define
if (!defined("APPPATH")) {
    define("APPPATH", $rootPath . "src/");
}

require_once APPPATH . "vendor/autoload.php";

define("TestPath", $rootPath . "test/");
define("TestCommonPath", $rootPath . "test/data/");
define("TestPhpPath", $rootPath . "test/php/");
define("TestLibPath", $rootPath . "test/lib/");
define("SourcePath", $rootPath . "src/");

define("DATABASE", Env::requireEnv("DATABASE"));
define("MONGODB_CONN", Env::requireEnv("MONGODB_CONN"));
define("MONGODB_USER", Env::get("MONGODB_USER"));
define("MONGODB_PASS", Env::get("MONGODB_PASS"));
define("SF_TESTPROJECT", "Test Project");
define("SF_TESTPROJECTCODE", "testcode1");
define("SF_TESTPROJECT2", "Test Project2");
define("SF_TESTPROJECTCODE2", "testcode2");
define("BCRYPT_COST", 7);

define("LANGUAGE_DEPOT_API_TOKEN", Env::requireEnv("LANGUAGE_DEPOT_API_TOKEN"));

require_once TestCommonPath . "MongoTestEnvironment.php";
