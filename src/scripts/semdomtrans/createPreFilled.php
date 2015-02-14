<?php
use models\languageforge\SemDomTransProjectModel;
use libraries\languageforge\semdomtrans\SemDomXMLExporter;
use models\languageforge\LfProjectModel;
use libraries\shared\Website;
use models\ProjectModel;

require_once('../scriptConfig.php');

use models\ProjectListModel;
use libraries\languageforge\semdomtrans;
use models\languageforge\semdomtrans\commands\SemDomTransProjectCommands;

$lang = $argv[1];
$domain = $argv[2];
$userId = $argv[3];
$appName = LfProjectModel::SEMDOMTRANS_APP;
$website = new Website($domain, Website::LANGUAGEFORGE);
echo $lang . "\n";
SemDomTransProjectCommands::createPreFilledSemdomProject($lang, $userId, $website);
?>
