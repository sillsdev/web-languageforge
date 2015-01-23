<?php
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

function processDomainNode($domainNode) {
	print $domainNode->Abbreviation->AUni . " " . $domainNode->Name->AUni . "\n";
	if (property_exists($domainNode, 'SubPossibilities')) {
		foreach ($domainNode->SubPossibilities->children() as $subDomainNode) {
			processDomainNode($subDomainNode);
		}
	}
}

foreach($xml->SemanticDomainList->CmPossibilityList->Possibilities->children() as $domainNode) {
	processDomainNode($domainNode);
}



echo "\n";
// loop over the set of languages to import

// verify that no project for that language exists

// if a previous project for that language and semantic domain version exists, DO NOT IMPORT

// create a new project for that language

// loop over each semdom item and create a new item model.  Write it to the database





/*foreach ($projectList->entries as $p) {
	print $p['projectName'] . "\n";
}

print "\n";
*/

?>
