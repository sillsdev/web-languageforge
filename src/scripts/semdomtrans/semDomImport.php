<?php
use models\languageforge\SemDomTransProjectModel;
use libraries\shared\Website;
use libraries\languageforge\semdomtrans\SemDomXMLImporter;
use models\languageforge\LfProjectModel;
use models\ProjectModel;
use models\commands\ProjectCommands;
use models\languageforge\semdomtrans\commands\SemDomTransProjectCommands;
use Palaso\Utilities\FileUtilities;

require_once('../scriptConfig.php');


$xmlFilePath = $argv[1];
$lang = $argv[2];
$domain = $argv[3];
$userId = $argv[4];
$isEnglish =  ($lang == "en");
$semdomVersion = 4;

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
    $projectID = ProjectCommands::createProject($projectName, $projectCode, $appName, $userId, $website);
    $projectModel = new SemDomTransProjectModel($projectID);

    $newXmlFilePath = $projectModel->getAssetsFolderPath() . '/' . basename($xmlFilePath);
    FileUtilities::createAllFolders($projectModel->getAssetsFolderPath());

    print "copying $xmlFilePath to  $newXmlFilePath\n";
    copy($xmlFilePath, $newXmlFilePath);
    $projectModel->xmlFilePath = $newXmlFilePath;
    $projectModel->languageIsoCode = $lang;
    $projectModel->semdomVersion = $semdomVersion;
    $projectModel->write();


    $importer = new SemDomXMLImporter($xmlFilePath, $projectModel, false, $isEnglish);
    $importer->run();
} else {
    echo "Project exists already" . "\n";
}


?>
