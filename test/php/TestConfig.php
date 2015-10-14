<?php

use Api\Library\Shared\Website;

$rootPath = realpath(__DIR__ . '/../../') . '/';

// Fake app path define
define('APPPATH', $rootPath . 'src/');

require_once APPPATH . 'vendor/autoload.php';

define('TestMode', true);

define('TestPath', $rootPath . 'test/php/');
define('TestLibPath', $rootPath . 'test/lib/');
define('SimpleTestPath', $rootPath . 'src/vendor/simpletest/simpletest/');
define('SourcePath', $rootPath . 'src/');

define('SF_DATABASE', 'scriptureforge_test');
define('SF_TESTPROJECT',      'Test Project');
define('SF_TESTPROJECTCODE',  'TestCode1');
define('SF_TESTPROJECT2',     'Test Project2');
define('SF_TESTPROJECTCODE2', 'TestCode2');
define('BCRYPT_COST', 7);

global $WEBSITE;
$WEBSITE = Website::get('dev.scriptureforge.org');
