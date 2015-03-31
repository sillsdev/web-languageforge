<?php
use models\languageforge\SemDomTransProjectModel;
use libraries\languageforge\semdomtrans\SemDomXMLExporter;
use models\ProjectListModel;
use libraries\languageforge\semdomtrans;
use models\ProjectModel;

require_once('../scriptConfig.php');



$lang = $argv[1];
$version = (int) $argv[2];
$testMode = false;


$projectModel = new SemDomTransProjectModel();
$projectModel->readByProperties(array("languageIsoCode" => $lang, "semdomVersion" => $version));

$xml = simplexml_load_file($projectModel->xmlFilePath);
$exporter = new SemDomXMLExporter($projectModel, $testMode,  ($argv[3] == "1"), true);

$exporter->run(); 
?>
