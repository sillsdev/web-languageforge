<?php

use Api\Library\Shared\Website;

$rootPath = realpath(__DIR__ . '/../..') . DIRECTORY_SEPARATOR;

// Fake app path define
if (! defined('APPPATH')) {
    define('APPPATH', $rootPath . 'src/');
}

if (! defined('ENVIRONMENT')) {
    define('ENVIRONMENT', 'development');
}

require_once APPPATH . 'vendor/autoload.php';

define('TestMode', true);

define('TestPath', $rootPath . 'test/');
define('TestCommonPath', $rootPath . 'test/common/');
define('TestPhpPath', $rootPath . 'test/php/');
define('TestLibPath', $rootPath . 'test/lib/');
define('SourcePath', $rootPath . 'src/');

define('SF_DATABASE', 'scriptureforge_test');
define('MONGODB_CONN', 'mongodb://db:27017');
define('SF_TESTPROJECT',      'Test Project');
define('SF_TESTPROJECTCODE',  'testcode1');
define('SF_TESTPROJECT2',     'Test Project2');
define('SF_TESTPROJECTCODE2', 'testcode2');
define('BCRYPT_COST', 7);

define('LANGUAGE_DEPOT_API_TOKEN', 'not-a-secret');

global $WEBSITE;
$WEBSITE = Website::get('languageforge.localhost');

require_once TestCommonPath . 'MongoTestEnvironment.php';
