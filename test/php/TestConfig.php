<?php

$rootPath = realpath(dirname(__FILE__) . '/../../') . '/';

//define('TestMode', true);

define('TestPath', $rootPath . 'test/php/');
define('TestLibPath', $rootPath . 'test/lib/');
define('SimpleTestPath', $rootPath . 'test/lib/simpletest/');
define('SourcePath', $rootPath . 'src/');

// Fake some CodeIgniter path defines
define('APPPATH', $rootPath . 'src/');
define('BASEPATH', $rootPath . 'lib/CodeIgniter_2.1.3/system/');

require_once(APPPATH . 'config/mongodb.php');
$config['default']['mongo_database'] = 'scriptureforge_test';

?>