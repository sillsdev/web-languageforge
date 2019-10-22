#!/usr/bin/php -q

<?php

require_once('../scriptsConfig.php');

use Api\Model\Shared\Dto\ProjectInsightsDto;
use Api\Library\Shared\Website;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

ProjectInsightsDto::csvInsightsToFile(Website::get('languageforge.org'), 'languageforge.csv');
ProjectInsightsDto::csvInsightsToFile(Website::get('scriptureforge.org'), 'scriptureforge.csv');
