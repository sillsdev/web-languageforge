<?php

use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Library\Shared\Website;
use Api\Library\Languageforge\Semdomtrans\SemDomXMLImporter;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\ProjectModel;
use Api\Model\Command\ProjectCommands;
use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransProjectCommands;
use Palaso\Utilities\FileUtilities;

require_once('../scriptConfig.php');


$xmlFilePath = $argv[1];
$lang = $argv[2];
$domain = $argv[3];
$userId = $argv[4];
$isEnglish =  ($lang == "en");
$semdomVersion = SemDomTransProjectModel::SEMDOM_VERSION;

// accept command line flag to actually change the database
// accept filepath of the import file (xml)
// accept semdom version number
// accept language code
$changeDatabase = false;

// process xml into a php data structure, organized by language
$xml = simplexml_load_file($xmlFilePath);

$lang = $argv[2];
$version = $argv[3];
$projectCode = "semdom-$lang-$semdomVersion";
$projectName = "Semdom $lang Project";
$appName = LfProjectModel::SEMDOMTRANS_APP;

$website = new Website($domain, Website::LANGUAGEFORGE);

// if a previous project for that language and semantic domain version exists, DO NOT IMPORT
$previousProject = new SemDomTransProjectModel();
$previousProject->readByProperties(array("languageIsoCode" => $lang, "semdomVersion" => $semdomVersion));

if ($previousProject->id->asString() == "")
{
    
    $sourceProject = new SemDomTransProjectModel();
    $sourceProject->readByCode("en");
    $projectID = ProjectCommands::createProject($projectName, $projectCode, $appName, $userId, $website);
    $projectModel = new SemDomTransProjectModel($projectID);

    $newXmlFilePath = $projectModel->getAssetsFolderPath() . '/' . basename($xmlFilePath);
    FileUtilities::createAllFolders($projectModel->getAssetsFolderPath());

    print "copying $xmlFilePath to  $newXmlFilePath\n";
    copy($xmlFilePath, $newXmlFilePath);
    $projectModel->xmlFilePath = $newXmlFilePath;
    $projectModel->languageIsoCode = $lang;
    $projectModel->semdomVersion = $semdomVersion;
    $projectModel->sourceLanguageProjectId = $sourceProject->id->asString();
    $projectModel->write();


    $importer = new SemDomXMLImporter($xmlFilePath, $projectModel, false, $isEnglish);
    $importer->run();
} else {
    echo "Project exists already" . "\n";
}
