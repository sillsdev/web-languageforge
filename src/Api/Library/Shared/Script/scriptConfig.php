<?php

$appPath = realpath(__DIR__ . '/../../../..');
$rootPath = dirname($appPath);

define('TestPath', $rootPath . '/test/');
define('APPPATH', $appPath . '/');

require_once APPPATH . 'vendor/autoload.php';
require_once APPPATH . 'config.php';
