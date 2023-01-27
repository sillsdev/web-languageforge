<?php
chdir(__DIR__);

require_once "/var/www/html/vendor/autoload.php";

use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

define("DATABASE", Env::requireEnv("DATABASE"));
define("MONGODB_CONN", Env::requireEnv("MONGODB_CONN"));
define("BCRYPT_COST", 7);
