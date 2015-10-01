<?php

/*---------------------------------------------------------------
 * Application Environment
 *---------------------------------------------------------------
 *
 * You can load different configurations depending on your
 * current environment. Setting the environment also influences
 * things like logging and error reporting.
 *
 * This can be set to anything, but default usage is:
 *
 *     development
 *     testing
 *     production
 *
 * NOTE: If you change these, also change the error_reporting() code in index.php
 *
 */

if (! defined('ENVIRONMENT')) {
    define('ENVIRONMENT', 'development');
}

/*---------------------------------------------------------------
 * General ScriptureForge Configuration
 *---------------------------------------------------------------
 */

if (! defined('SF_DATABASE')) {
    define('SF_DATABASE', 'scriptureforge');
}

if (! defined('SF_USE_MINIFIED_JS')) {
    if (defined('ENVIRONMENT') and ENVIRONMENT === 'development') {
        define('SF_USE_MINIFIED_JS', false);
    } else {
        define('SF_USE_MINIFIED_JS', true);
    }
}

define('NG_BASE_FOLDER', 'angular-app/');

if (! defined('REMEMBER_ME_SECRET')) {
    define('REMEMBER_ME_SECRET', 'not_a_secret');
}
