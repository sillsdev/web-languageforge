<?php

$rootPath = dirname(__DIR__);

define('TestPath', $rootPath . '/test/');
define('APPPATH', $rootPath . '/html/');

require_once APPPATH . 'vendor/autoload.php';

define('SF_DATABASE', 'scriptureforge');
define('BCRYPT_COST', 7);
define('MONGODB_CONN', 'mongodb://db:27017');
