<?php
use models\languageforge\SemDomTransProjectModel;

use libraries\languageforge\semdomtrans\SemDomXMLImporter;

use models\ProjectModel;

require_once('../scriptConfig.php');

use models\ProjectListModel;

// accept command line flag to actually change the database
// accept filepath of the import file (xml)
// accept semdom version number
// accept language code
$changeDatabase = false;

// process xml into a php data structure, organized by language
$xmlFilePath = $argv[1];
$xml = simplexml_load_file($xmlFilePath);

$lang = $argv[2];
$version = $argv[3];
$testMode = true;
$projectModel = new SemDomTransProjectModel();

// todo: check that we are setting the right "language" property
$projectModel->languageIsoCode = $lang;
$projectModel->semdomVersion = $version;
$projectModel->projectCode = "semdom-$lang-$version";

// loop over the set of languages to import

// if a previous project for that language and semantic domain version exists, DO NOT IMPORT
$previousProject = new SemDomTransProjectModel();
$previousProject->readByProperties(array("languageIsoCode" => $projectModel->languageIsoCode, "semdomVersion" => $projectModel->semdomVersion));

if ($previousProject->id->asString() == "")
{
	//create project
	if (!$testMode)
	{
		$projectModel->write();
	}
		
	// loop over each semdom item and create a new item model.  Write it to the database
	$importer = new SemDomXMLImporter($argv[1], $projectModel, false);
	$importer->run();
	
	$newXmlFilePath = $projectModel->getAssetsFolderPath() . '/' . basename($xmlFilePath);
	print "copying $xmlFilePath to $newXmlFilePath\n";
	if (!$testMode) {
	    copy($xmlFilePath, $newXmlFilePath);
	    $projectModel->sourceXMLPath = $newXmlFilePath;
	    $projectModel->write();
	}
	
} else {
	echo "Project exists already" . "\n";
}


?>
