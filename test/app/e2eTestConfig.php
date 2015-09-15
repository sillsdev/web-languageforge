<?php
$rootPath = realpath(__DIR__.'/../../');

define('TestPath', $rootPath.'/test/app');
define('APPPATH', $rootPath.'/src/');

require_once APPPATH.'vendor/autoload.php';

require_once APPPATH.'config.php';
