<?php
use models\languageforge\SemDomTransProjectModel;

use libraries\languageforge\semdomtrans\SemDomXMLImporter;

use models\ProjectModel;

require_once('../scriptConfig.php');

use models\ProjectListModel;


$index = 0;


$projectList = new ProjectListModel();
$projectList->read();

// accept command line flag to actually change the database
// accept filepath of the import file (xml)
// accept semdom version number
// accept language code
$changeDatabase = false;

// process xml into a php data structure, organized by language
$xml = simplexml_load_file($argv[1]);

$lang = "en";
$version = "7";

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
	$projectModel->write();
		
	// loop over each semdom item and create a new item model.  Write it to the database
	$importer = new SemDomXMLImporter($argv[1], $projectModel, false);
	$importer->run();
} else {
	echo "Project exists already" . "\n";
}


?>
