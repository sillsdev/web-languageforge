<?php

use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

define('ENVIRONMENT', Env::requireEnv('ENVIRONMENT'));
define('DATABASE', Env::requireEnv('DATABASE'));
define('MONGODB_CONN', Env::requireEnv('MONGODB_CONN'));
define('LANGUAGE_DEPOT_API_TOKEN', Env::requireEnv('LANGUAGE_DEPOT_API_TOKEN'));

define('BCRYPT_COST', 7);
