<?php

require_once('../scriptsConfig.php');

use Api\Library\Languageforge\Semdomtrans;
use Api\Library\Shared\Website;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransProjectCommands;

$lang = $argv[1];
$domain = $argv[2];
$userId = $argv[3];
$appName = LfProjectModel::SEMDOMTRANS_APP;
$website = new Website($domain, Website::LANGUAGEFORGE);
echo $lang . "\n";
SemDomTransProjectCommands::createPreFilledSemdomProject($lang, $userId, $website);
