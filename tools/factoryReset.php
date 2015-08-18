#!/usr/bin/php -q
<?php
require_once('toolsConfig.php');



// use commands go here (after the e2eTestConfig)
use Api\Model\Command\UserCommands;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\ProjectModel;
use Api\Library\Shared\Website;
use Api\Model\ProjectListModel;

if (php_sapi_name() != 'cli') { die('this script must be run on the command-line'); }

$scriptureforgeWebsite = Website::get('scriptureforge.org');
$languageforgeWebsite = Website::get('languageforge.org');

// remove all existing projects
$runForReal = false;
if (count($argv) > 1 && $argv[1] == 'run') {
    $runForReal = true;
} else {
    print "\nTest Mode - no data will be changed\n--------------------------------\n\n";
}

$projectList = new ProjectListModel();
$projectList->read();

print "{$projectList->count} projects will be deleted\n\n";

foreach ($projectList->entries as $p) {
   $project = new ProjectModel($p['id']);
   print "Deleting Project " . $project->projectName . "\n";
   if ($runForReal) {
       try {
           $project->remove();
       } catch (\Exception $e) {
           // don't do anything
       }
   }
}

// start with a fresh database
print "\nDropping main database...\n";
if ($runForReal) {
    $db = \Api\Model\Mapper\MongoStore::connect(SF_DATABASE);
    foreach ($db->listCollections() as $collection) { $collection->drop(); }
}

print "\nDropping other dbs on the server (like test dbs)\n";
if ($runForReal) {
    $cmd = "mongo --quiet --eval 'db.getMongo().getDBNames().forEach(function(i){  if (i.indexOf(\"sf_\") == 0 || i.indexOf(\"scriptureforge\") == 0) { print(\"Dropping \" + i); db.getSiblingDB(i).dropDatabase()}})'";
    system($cmd);
}


print "\nCreating user: admin password: password\n";
if ($runForReal) {
    $adminUser = UserCommands::createUser(array(
        'id' => '',
        'name' => 'Admin',
        'email' => 'admin@admin.com',
        'username' => 'admin',
        'password' => 'password',
        'active' => true,
        'role' => SystemRoles::SYSTEM_ADMIN),
        $languageforgeWebsite
    );
}
print "\n\n";
