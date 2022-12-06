#!/usr/bin/php -q

<?php
require_once "scriptsConfig.php";

use Api\Model\Shared\Dto\ProjectInsightsDto;

php_sapi_name() == "cli" or die("this script must be run on the command-line");

ProjectInsightsDto::csvInsightsToFile("languageforge.csv");

