<?php
use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Library\Languageforge\Semdomtrans\SemDomXMLExporter;
use Api\Model\Languageforge\LfProjectModel;
use Api\Library\Shared\Website;
use Api\Model\ProjectModel;

require_once('../scriptConfig.php');

use Api\Model\ProjectListModel;
use Api\Library\Languageforge\Semdomtrans;
use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransProjectCommands;

$lang = $argv[1];
$domain = $argv[2];
$userId = $argv[3];
$appName = LfProjectModel::SEMDOMTRANS_APP;
$website = new Website($domain, Website::LANGUAGEFORGE);
echo $lang . "\n";
SemDomTransProjectCommands::createPreFilledSemdomProject($lang, $userId, $website);
