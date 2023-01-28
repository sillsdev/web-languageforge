#!/usr/bin/php -q

<?php
require_once "scriptsConfig.php";
require_once "Analytics.php";

php_sapi_name() == "cli" or die("this script must be run on the command-line");

Analytics::csvDataToFolder("csv");

