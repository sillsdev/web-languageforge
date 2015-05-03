<?php
use models\languageforge\SemDomTransProjectModel;
use libraries\languageforge\semdomtrans\SemDomXMLExporter;
use models\ProjectListModel;
use libraries\languageforge\semdomtrans;
use models\ProjectModel;
use models\languageforge\semdomtrans\SemDomTransStatus;

require_once('../scriptConfig.php');



$lang = $argv[1];
$version = SemDomTransProjectModel::SEMDOM_VERSION;
$testMode = false;


$projectModel = new SemDomTransProjectModel();
$projectModel->readByProperties(array("languageIsoCode" => $lang, "semdomVersion" => $version));

$xml = simplexml_load_file($projectModel->xmlFilePath);
$exporter = new SemDomXMLExporter($projectModel, $testMode,  ($argv[2] == "1"), ($argv[3] == "1"));

$exporter->run(); 
?>
