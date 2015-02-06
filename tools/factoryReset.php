#!/usr/bin/php -q
<?php
require_once('toolsConfig.php');



// use commands go here (after the e2eTestConfig)
use models\commands\ProjectCommands;
use models\commands\UserCommands;
use models\commands\TextCommands;
use models\commands\QuestionCommands;
use models\commands\QuestionTemplateCommands;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SiteRoles;
use models\shared\rights\SystemRoles;
use models\scriptureforge\SfProjectModel;
use models\languageforge\LfProjectModel;
use models\ProjectModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\commands\LexEntryCommands;
use models\languageforge\lexicon\commands\LexUploadCommands;
use models\languageforge\lexicon\config\LexiconConfigObj;
use libraries\shared\Website;
use models\ProjectListModel;

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
    $db = \models\mapper\MongoStore::connect(SF_DATABASE);
    foreach ($db->listCollections() as $collection) { $collection->drop(); }
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
