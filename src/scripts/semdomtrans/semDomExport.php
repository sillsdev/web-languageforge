<?php

use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Library\Languageforge\Semdomtrans\SemDomXMLExporter;
use Api\Model\ProjectListModel;
use Api\Library\Languageforge\Semdomtrans;
use Api\Model\ProjectModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;

require_once('../scriptConfig.php');


$lang = $argv[1];
$version = SemDomTransProjectModel::SEMDOM_VERSION;
$testMode = false;


$projectModel = new SemDomTransProjectModel();
$projectModel->readByProperties(array("languageIsoCode" => $lang, "semdomVersion" => $version));

$xml = simplexml_load_file($projectModel->xmlFilePath);
$exporter = new SemDomXMLExporter($projectModel, $testMode,  ($argv[2] == "1"), ($argv[3] == "1"));

$exporter->run(); 
