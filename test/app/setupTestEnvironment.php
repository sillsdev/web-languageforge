<?php

require_once('e2eTestConfig.php');

// use commands go here (after the e2eTestConfig)
use Api\Library\Shared\Website;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Command\LexUploadCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;

$constants = json_decode(file_get_contents(TestPath . 'app/testConstants.json'), true);

// Fake some $_SERVER variables like HTTP_HOST for the sake of the code that needs it
if (count($argv) > 1) {
    // hostname is passed in on command line
    $hostname = $argv[1];
}
$website = Website::get();
$site = $website->base;

// start with a fresh database
MongoStore::dropAllCollections(DATABASE);

// Also empty out databases for the test projects
$projectArrays = [
    $constants['testProjectName']   => $constants['testProjectCode'],
    $constants['otherProjectName']  => $constants['otherProjectCode'],
    $constants['thirdProjectName']  => $constants['thirdProjectCode'],
    $constants['fourthProjectName'] => $constants['fourthProjectCode'],
    $constants['newProjectName']    => $constants['newProjectCode'],
    $constants['emptyProjectName']  => $constants['emptyProjectCode'],
    $constants['srProjectName']     => $constants['srProjectCode']
];

foreach ($projectArrays as $projectName => $projectCode) {
    $projectModel = new ProjectModel();
    $projectModel->projectName = $projectName;
    $projectModel->projectCode = $projectCode;
    MongoStore::dropAllCollections($projectModel->databaseName());
    MongoStore::dropDB($projectModel->databaseName());
}

$adminUserId = UserCommands::createUser([
    'name' => $constants['adminName'],
    'email' => $constants['adminEmail'],
    'password' => $constants['adminPassword']
],
    $website
);
$adminUserId = UserCommands::updateUser([
    'id' => $adminUserId,
    'name' => $constants['adminName'],
    'email' => $constants['adminEmail'],
    'username' => $constants['adminUsername'],
    'password' => $constants['adminPassword'],
    'active' => true,
    'role' => SystemRoles::SYSTEM_ADMIN
],
    $website
);
$managerUserId = UserCommands::createUser([
    'name' => $constants['managerName'],
    'email' => $constants['managerEmail'],
    'password' => $constants['managerPassword']
],
    $website
);
$managerUserId = UserCommands::updateUser([
    'id' => $managerUserId,
    'name' => $constants['managerName'],
    'email' => $constants['managerEmail'],
    'username' => $constants['managerUsername'],
    'password' => $constants['managerPassword'],
    'active' => true,
    'role' => SystemRoles::USER
],
    $website
);
$memberUserId = UserCommands::createUser([
    'name' => $constants['memberName'],
    'email' => $constants['memberEmail'],
    'password' => $constants['memberPassword']
],
    $website
);
$memberUserId = UserCommands::updateUser([
    'id' => $memberUserId,
    'name' => $constants['memberName'],
    'email' => $constants['memberEmail'],
    'username' => $constants['memberUsername'],
    'password' => $constants['memberPassword'],
    'active' => true,
    'role' => SystemRoles::USER
],
    $website
);
$member2UserId = UserCommands::createUser([
    'name' => $constants['member2Name'],
    'email' => $constants['member2Email'],
    'password' => $constants['member2Password']
],
    $website
);
$member2UserId = UserCommands::updateUser([
    'id' => $member2UserId,
    'name' => $constants['member2Name'],
    'email' => $constants['member2Email'],
    'username' => $constants['member2Username'],
    'password' => $constants['member2Password'],
    'active' => true,
    'role' => SystemRoles::USER
],
    $website
);
$expiredUserId = UserCommands::createUser([
    'name' => $constants['expiredName'],
    'email' => $constants['expiredEmail'],
    'password' => $constants['memberPassword']
], // intentionally set wrong password
    $website
);
$expiredUserId = UserCommands::updateUser([
    'id' => $expiredUserId,
    'name' => $constants['expiredName'],
    'email' => $constants['expiredEmail'],
    'username' => $constants['expiredUsername'],
    'password' => $constants['memberPassword'], // intentionally set wrong password
    'active' => true,
    'role' => SystemRoles::USER
],
    $website
);
$resetUserId = UserCommands::createUser([
    'name' => $constants['resetName'],
    'email' => $constants['resetEmail'],
    'password' => $constants['memberPassword']
], // intentionally set wrong password
    $website
);
$resetUserId = UserCommands::updateUser([
    'id' => $resetUserId,
    'name' => $constants['resetName'],
    'email' => $constants['resetEmail'],
    'username' => $constants['resetUsername'],
    'password' => $constants['memberPassword'], // intentionally set wrong password
    'active' => true,
    'role' => SystemRoles::USER
],
    $website
);
$observerUserId = UserCommands::createUser([
    'name' => $constants['observerName'],
    'email' => $constants['observerEmail'],
    'password' => $constants['observerPassword']
],
    $website
);
$observerUserId = UserCommands::updateUser([
    'id' => $observerUserId,
    'name' => $constants['observerName'],
    'email' => $constants['observerEmail'],
    'username' => $constants['observerUsername'],
    'password' => $constants['observerPassword'],
    'active' => true,
    'role' => SystemRoles::USER
],
    $website
);

// set forgot password with expired date
$today = new DateTime();
$expiredUser = new UserModel($expiredUserId);
$expiredUser->resetPasswordKey = $constants['expiredPasswordKey'];
$expiredUser->resetPasswordExpirationDate = $today;
$expiredUser->write();

// set forgot password with valid date
$resetUser = new UserModel($resetUserId);
$resetUser->resetPasswordKey = $constants['resetPasswordKey'];
$resetUser->resetPasswordExpirationDate = $today->add(new DateInterval('P5D'));
$resetUser->write();

$projectType = null;
$projectType = LfProjectModel::LEXICON_APP;
$testProjectId = ProjectCommands::createProject(
    $constants['testProjectName'],
    $constants['testProjectCode'],
    $projectType,
    $adminUserId,
    $website
);
$testProjectModel = new ProjectModel($testProjectId);
$testProjectModel->projectCode = $constants['testProjectCode'];
$testProjectModel->allowInviteAFriend = $constants['testProjectAllowInvites'];
$testProjectModel->write();

$otherProjectId = ProjectCommands::createProject(
    $constants['otherProjectName'],
    $constants['otherProjectCode'],
    $projectType,
    $managerUserId,
    $website
);
$otherProjectModel = new ProjectModel($otherProjectId);
$otherProjectModel->projectCode = $constants['otherProjectCode'];
$otherProjectModel->allowInviteAFriend = $constants['otherProjectAllowInvites'];
$otherProjectModel->write();

$fourthProjectId = ProjectCommands::createProject(
    $constants['fourthProjectName'],
    $constants['fourthProjectCode'],
    $projectType,
    $managerUserId,
    $website
);
$fourthProjectModel = new ProjectModel($fourthProjectId);
$fourthProjectModel->projectCode = $constants['fourthProjectCode'];
$fourthProjectModel->allowInviteAFriend = $constants['fourthProjectAllowInvites'];
$fourthProjectModel->write();

$srProject = [
    'identifier' => $constants['srIdentifier'],
    'name' => $constants['srName'],
    'repository' => 'https://public.languagedepot.org',
    'role' => 'manager'
];
$srTestProjectId = ProjectCommands::createProject(
    $constants['srProjectName'],
    $constants['srProjectCode'],
    $projectType,
    $managerUserId,
    $website,
    $srProject
);

ProjectCommands::updateUserRole($testProjectId, $managerUserId, ProjectRoles::MANAGER);
ProjectCommands::updateUserRole($testProjectId, $memberUserId, ProjectRoles::CONTRIBUTOR);
ProjectCommands::updateUserRole($testProjectId, $member2UserId, ProjectRoles::CONTRIBUTOR);
ProjectCommands::updateUserRole($testProjectId, $resetUserId, ProjectRoles::CONTRIBUTOR);
ProjectCommands::updateUserRole($otherProjectId, $adminUserId, ProjectRoles::MANAGER);
ProjectCommands::updateUserRole($fourthProjectId, $adminUserId, ProjectRoles::MANAGER);
ProjectCommands::updateUserRole($srTestProjectId, $adminUserId, ProjectRoles::MANAGER);

// Set up LanguageForge E2E test envrionment here
ProjectCommands::updateUserRole($testProjectId, $observerUserId, LexRoles::OBSERVER);
$testProjectModel = new LexProjectModel($testProjectId);
$testProjectModel->addInputSystem('th-fonipa', 'tipa', 'Thai');
$testProjectModel->config->entry->fields[LexConfig::LEXEME]->inputSystems[] = 'th-fonipa';
$testProjectModel->addInputSystem('th-Zxxx-x-audio', 'taud', 'Thai Voice');
$testProjectModel->config->entry->fields[LexConfig::LEXEME]->inputSystems[] = 'th-Zxxx-x-audio';
$testProjectId = $testProjectModel->write();

// setup to mimic file upload
$fileName = $constants['testEntry1']['lexeme']['th-Zxxx-x-audio']['value'];
$file = [];
$file['name'] = $fileName;
$_FILES['file'] = $file;

// put a copy of the test file in tmp
$tmpFilePath = sys_get_temp_dir() . "/CopyOf$fileName";
copy(TestPath . "common/$fileName", $tmpFilePath);

$response = LexUploadCommands::uploadAudioFile($testProjectId, 'audio', $tmpFilePath);

// cleanup tmp file if it still exists
if (file_exists($tmpFilePath) && ! is_dir($tmpFilePath)) {
    @unlink($tmpFilePath);
}

// put uploaded file into entry1
$constants['testEntry1']['lexeme']['th-Zxxx-x-audio']['value'] = $response->data->fileName;

// setup to mimic file upload
$fileName = $constants['testEntry1']['senses'][0]['pictures'][0]['fileName'];
$file = [];
$file['name'] = $fileName;
$_FILES['file'] = $file;

// put a copy of the test file in tmp
$tmpFilePath = sys_get_temp_dir() . "/CopyOf$fileName";
copy(TestPath . "common/$fileName", $tmpFilePath);

$response = LexUploadCommands::uploadImageFile($testProjectId, 'sense-image', $tmpFilePath);

// cleanup tmp file if it still exists
if (file_exists($tmpFilePath) && ! is_dir($tmpFilePath)) {
    @unlink($tmpFilePath);
}

// put uploaded file into entry1
$constants['testEntry1']['senses'][0]['pictures'][0]['fileName'] = $response->data->fileName;

$entry1 = LexEntryCommands::updateEntry($testProjectId,
    [
        'id' => '',
        'lexeme' => $constants['testEntry1']['lexeme'],
        'senses' => $constants['testEntry1']['senses']
    ], $managerUserId);
$entry2 = LexEntryCommands::updateEntry($testProjectId,
    [
        'id' => '',
        'lexeme' => $constants['testEntry2']['lexeme'],
        'senses' => $constants['testEntry2']['senses']
    ], $managerUserId);
$multipleMeaningEntry1 = LexEntryCommands::updateEntry($testProjectId,
    [
        'id' => '',
        'lexeme' => $constants['testMultipleMeaningEntry1']['lexeme'],
        'senses' => $constants['testMultipleMeaningEntry1']['senses']
    ], $managerUserId);

// put mock uploaded zip import (jpg file)
$fileName = $constants['testMockJpgImportFile']['name'];
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
copy(TestPath . "common/$fileName", $tmpFilePath);

// put mock uploaded zip import (zip file)
$fileName = $constants['testMockZipImportFile']['name'];
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
copy(TestPath . "common/$fileName", $tmpFilePath);

// put mock uploaded audio (png file)
$fileName = $constants['testMockPngUploadFile']['name'];
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
copy(TestPath . "common/$fileName", $tmpFilePath);

// put mock uploaded audio (mp3 file)
$fileName = $constants['testMockMp3UploadFile']['name'];
$tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
copy(TestPath . "common/$fileName", $tmpFilePath);
