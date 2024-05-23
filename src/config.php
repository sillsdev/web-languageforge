<?php

use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

define("ENVIRONMENT", Env::requireEnv("ENVIRONMENT"));
define("DATABASE", Env::requireEnv("DATABASE"));
define("MONGODB_CONN", Env::requireEnv("MONGODB_CONN"));
define("MONGODB_AUTHSOURCE", Env::get("MONGODB_AUTHSOURCE"));
define("MONGODB_USER", Env::get("MONGODB_USER"));
define("MONGODB_PASS", Env::get("MONGODB_PASS"));
define("LANGUAGE_DEPOT_API_TOKEN", Env::requireEnv("LANGUAGE_DEPOT_API_TOKEN"));

define("BCRYPT_COST", 7);
