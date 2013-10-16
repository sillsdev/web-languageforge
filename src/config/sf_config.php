<?php

// CodeIgniter style config for 3rd party CodeIgniter plugins used by ScriptureForge

$config['db'] = 'scriptureforge';

// General ScriptureForge Configuration

if (!defined('SF_DATABASE')) {
	define('SF_DATABASE', $config['db']);
}

define('SF_DEFAULT_EMAIL',      'no-reply@scriptureforge.org');
define('SF_DEFAULT_EMAIL_NAME', 'ScriptureForge');

?>
