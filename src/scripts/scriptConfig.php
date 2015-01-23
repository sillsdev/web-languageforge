<?php
$rootPath = realpath(dirname(__FILE__) . '/../../');

define('APPPATH', $rootPath . '/src/');
define('BASEPATH', $rootPath . '/lib/CodeIgniter_2.1.3/system/');

require_once(APPPATH . 'helpers/loader_helper.php');
require_once(APPPATH . 'vendor/autoload.php');
require_once(APPPATH . 'config/sf_config.php');

Loader::register();

?>
