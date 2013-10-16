<?php

$config['db'] = 'scriptureforge';
// Should be either 'dev' or 'prod', in lowercase with single-quotes
$config['sfenv'] = 'dev';

if (!defined('SF_DATABASE')) {
	define('SF_DATABASE', $config['db']);
}

if (!defined('SF_USE_MINIFIED_JS')) {
	if ('dev' === $config['sfenv']) {
		define('SF_USE_MINIFIED_JS', false);
	} else {
		define('SF_USE_MINIFIED_JS', true);
	}
}

?>
