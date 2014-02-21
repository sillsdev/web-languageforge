<?php

$rootPath = dirname(__FILE__) . '/';

if (!defined('SOURCE_PATH')) {
	define('SOURCE_PATH', $rootPath);
}

if(!defined('TestMode')) {
	// TODO Delete. We don't have mysql anymore so these can go. CP 2013-12
	//defining database connection variables as constants
	define('DB_SERVER', 'localhost');
	define('DB_USER', 'lfweb7');
	define('DB_PASS', '123456');
	define('DB_NAME', 'lfweb7');
	define('IS_DEV_MODE', 0);	
	define('SHOW_ERROR_DETAIL_CLIENT', 1);
}

if (!defined('APPPATH')) {
	define('APPPATH', $rootPath = dirname(__FILE__) . '/../../');
}

if (!defined('LF_LIBRARY_PATH')) {
	define('LF_LIBRARY_PATH', APPPATH . 'libraries/lfdictionary/');
}

define('LANGUAGEFORGE_VAR_PATH', '/var/lib/languageforge/');

define('LANGUAGEFORGE_LOG_PATH', '/tmp/');

//Language Depot Database name
define('LANG_DEPOT_DB_NAME', 'languagedepot');

define('LANGUAGE_FORGE_DEFAULT_SETTINGS_RWC', 'WeSayConfig.Rwc.Default'); // TODO Move. To the LFRapidWords project CP 2012-09
define('LANGUAGE_FORGE_DEFAULT_SETTINGS', 'default.WeSayConfig');	// TODO Rename. If a user named "default" will make problem!

define('VCS_MASTER_PATH', '/var/vcs/languageforge/');
define('LANGUAGE_FORGE_WORK_PATH', '/var/lib/languageforge/work/'); // TODO Move. This doesn't need to be configurable. Should be in a static method somewhere CP 2012-10


define('LEXICON_WORD_PACK_FILE_NAME', 'SILCawl.lift');

// use for gather words from list.
define('LEXICON_WORD_LIST_SOURCE', '/var/lib/languageforge/lexicon/wordpacks/');

//point to root folder of dictionaries.
define('PROJECTS_HG_ROOT_FOLDER', '/var/lib/languageforge/work/');


define('LANGUAGE_FORGE_DEFAULT_SETTINGS_LEX', 'WeSayConfig.Lex.Default');

// the folder too keep per user settings in a project
define('LANGUAGE_FORGE_SETTINGS', '/LanguageForgeSettings/');

?>