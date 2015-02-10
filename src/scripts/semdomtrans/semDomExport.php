<?php
use models\languageforge\SemDomTransProjectModel;
use libraries\languageforge\semdomtrans\SemDomXMLExporter;

use models\ProjectModel;

require_once('../scriptConfig.php');

use models\ProjectListModel;
use libraries\languageforge\semdomtrans;

$lang = $argv[1];
$version = $argv[2];
$testMode = false;
$projectModel = new SemDomTransProjectModel();

$projectModel->languageIsoCode = $lang;
$projectModel->semdomVersion = $version;
$projectModel->projectCode = "semdom-$lang-$version";
$projectModel->readByProperties(array("languageIsoCode" => $projectModel->languageIsoCode, "semdomVersion" => $projectModel->semdomVersion));


$xml = simplexml_load_file($projectModel->newXmlFilePath);
$exporter = new SemDomXMLExporter($projectModel, true);

$exporter->run();
?>
