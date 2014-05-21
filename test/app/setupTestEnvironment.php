<?php
require_once('e2eTestConfig.php');

// put the test config into place
copy(SFCONFIG . '.fortest', SFCONFIG);
copy(MONGOCONFIG . '.fortest', MONGOCONFIG);

// use commands go here (after the e2eTestConfig)
use models\commands\ProjectCommands;
use models\commands\UserCommands;
use models\commands\TextCommands;
use models\commands\QuestionCommands;
use models\rights\Roles;
use models\scriptureforge\SfProjectModel;
use libraries\shared\Website;

// Fake some $_SERVER variables like HTTP_HOST for the sake of the code that needs it
$_SERVER['HTTP_HOST'] = 'scriptureforge.local'; // TODO: Consider parsing protractorConf.js and loading baseUrl from it

//print_r($_SERVER);

// start with a fresh database
$db = \models\mapper\MongoStore::connect(SF_DATABASE);
foreach ($db->listCollections() as $collection) { $collection->drop(); }

$constants = json_decode(file_get_contents(TestPath . '/testConstants.json'), true);

//print_r(UserCommands::listUsers());

$adminUser = UserCommands::createUser(array(
	'id' => '',
	'name' => $constants['adminName'],
	'email' => $constants['adminEmail'],
	'username' => $constants['adminUsername'],
	'password' => $constants['adminPassword'],
	'active' => true,
	'role' => Roles::SYSTEM_ADMIN
));
$managerUser = UserCommands::createUser(array(
	'id' => '',
	'name' => $constants['managerName'],
	'email' => $constants['managerEmail'],
	'username' => $constants['managerUsername'],
	'password' => $constants['managerPassword'],
	'active' => true,
	'role' => Roles::USER // Should this be Roles::PROJECT_ADMIN? I think not; I think that's set per-project. 2014-05 RM
));
$memberUser = UserCommands::createUser(array(
	'id' => '',
	'name' => $constants['memberName'],
	'email' => $constants['memberEmail'],
	'username' => $constants['memberUsername'],
	'password' => $constants['memberPassword'],
	'active' => true,
	'role' => Roles::USER
));

$testProject = ProjectCommands::createProject(
	$constants['testProjectName'],
	SfProjectModel::SFCHECKS_APP, // TODO: Find out if there's a better constant for this. 2014-05 RM
	$adminUser,
	Website::SCRIPTUREFORGE
);
$otherProject = ProjectCommands::createProject(
	$constants['otherProjectName'],
	SfProjectModel::SFCHECKS_APP, // TODO: Find out if there's a better constant for this. 2014-05 RM
	$adminUser,
	Website::SCRIPTUREFORGE
);

ProjectCommands::updateUserRole($testProject, array(
	'id' => $managerUser,
	'role' => Roles::PROJECT_ADMIN
));
ProjectCommands::updateUserRole($testProject, array(
	'id' => $memberUser,
	'role' => Roles::USER
));

$text1 = TextCommands::updateText($testProject, array(
	'id' => '',
	'title' => $constants['testText1Title'],
	'content' => $constants['testText1Content']
));
$text2 = TextCommands::updateText($testProject, array(
	'id' => '',
	'title' => $constants['testText2Title'],
	'content' => $constants['testText2Content']
));

echo("$text1\n");

$question1 = QuestionCommands::updateQuestion($testProject, array(
	'id' => '',
	'textRef' => $text1,
	'title' => $constants['testText1Question1Title'],
	'description' => $constants['testText1Question1Content']
));
$question2 = QuestionCommands::updateQuestion($testProject, array(
	'id' => '',
	'textRef' => $text1,
	'title' => $constants['testText1Question2Title'],
	'description' => $constants['testText1Question2Content']
));

echo("$question1\n");
//print_r(UserCommands::listUsers());

?>