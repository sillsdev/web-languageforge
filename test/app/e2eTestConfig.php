<?php
$rootPath = realpath(dirname(__FILE__) . '/../../');

define('TestPath', $rootPath . '/test');
define('APPPATH', $rootPath . '/src/');
define('BASEPATH', $rootPath . '/lib/CodeIgniter_2.1.3/system/');

require_once(APPPATH . 'helpers/loader_helper.php');
require_once(APPPATH . 'vendor/autoload.php');

define('SF_DATABASE', 'scriptureforge_test');
define('SFCONFIG', APPPATH . 'config/sf_config.php');
define('MONGOCONFIG', APPPATH . 'config/mongodb.php');
require_once(SFCONFIG);

require_once APPPATH . 'helpers/loader_helper.php';
Loader::register();



?>