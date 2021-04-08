<?php

use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

define('ENVIRONMENT', Env::requireEnv('ENVIRONMENT'));
define('DATABASE', Env::requireEnv('DATABASE'));
define('LANGUAGE_DEPOT_API_TOKEN', Env::requireEnv('LANGUAGE_DEPOT_API_TOKEN'));

if (! defined('MONGODB_CONN')) {
    define('MONGODB_CONN', 'mongodb://db:27017');
}

define('BCRYPT_COST', 7);
