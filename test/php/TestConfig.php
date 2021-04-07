<?php

use Api\Library\Shared\Website;
use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

$rootPath = realpath(__DIR__ . '/../..') . DIRECTORY_SEPARATOR;

// Fake app path define
if (! defined('APPPATH')) {
    define('APPPATH', $rootPath . 'src/');
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

define('LANGUAGE_DEPOT_API_TOKEN', Env::requireEnv('LANGUAGE_DEPOT_API_TOKEN'));

global $WEBSITE;
$WEBSITE = Website::get('localhost');

require_once TestCommonPath . 'MongoTestEnvironment.php';
