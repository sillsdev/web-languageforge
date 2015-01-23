<?php
require_once('../scriptConfig.php');

use models\ProjectListModel;


$projectList = new ProjectListModel();
$projectList->read();

// accept command line flag to actually change the database
// accept filepath of the import file (xml)
$changeDatabase = false;

// process xml into a php data structure, organized by language

// loop over the set of languages to import

// verify that no project for that language exists

// if a previous project for that language and semantic domain version exists, DO NOT IMPORT

// create a new project for that language

// loop over each semdom item and create a new item model.  Write it to the database





foreach ($projectList->entries as $p) {
	print $p['projectName'] . "\n";
}

print "\n";


?>
