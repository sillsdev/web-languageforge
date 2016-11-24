<?php

require_once('e2eTestConfig.php');

// use commands go here (after the e2eTestConfig)
use Api\Library\Shared\Website;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Scriptureforge\Sfchecks\Command\TextCommands;
use Api\Model\Scriptureforge\Sfchecks\Command\QuestionCommands;
use Api\Model\Scriptureforge\Sfchecks\Command\QuestionTemplateCommands;
use Api\Model\Scriptureforge\SfProjectModel;
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
$hostname = "languageforge.local";
if (count($argv) > 1) {
    // hostname is passed in on command line
    $hostname = $argv[1];
}
$_SERVER['HTTP_HOST'] = $hostname;
$website = Website::get($hostname);
if (is_null($website)) {
    exit("Error: $hostname is not a registered website hostname!\n\n");
}
$site = $website->base;

// start with a fresh database
MongoStore::dropAllCollections(SF_DATABASE);

// Also empty out databases for the test projects
$projectArrays = array(
    $constants['testProjectName']  => $constants['testProjectCode'],
    $constants['otherProjectName'] => $constants['otherProjectCode'],
    $constants['fourthProjectName'] => $constants['fourthProjectCode'],
    $constants['srProjectName'] => $constants['srProjectCode']
);

foreach ($projectArrays as $projectName => $projectCode) {
    $projectModel = new ProjectModel();
    $projectModel->projectName = $projectName;
    $projectModel->projectCode = $projectCode;
    MongoStore::dropAllCollections($projectModel->databaseName());
}

// drop the third database because it is used in a rename test
$projectModel = new ProjectModel();
$projectModel->projectName = $constants['thirdProjectName'];
$projectModel->projectCode = $constants['thirdProjectCode'];
MongoStore::dropDB($projectModel->databaseName());

// drop the 'new' and 'empty' database because it is used in a 'create new project' test
$projectModel = new ProjectModel();
$projectModel->projectName = $constants['newProjectName'];
$projectModel->projectCode = $constants['newProjectCode'];
MongoStore::dropDB($projectModel->databaseName());
$projectModel = new ProjectModel();
$projectModel->projectName = $constants['emptyProjectName'];
$projectModel->projectCode = $constants['emptyProjectCode'];
MongoStore::dropDB($projectModel->databaseName());

$adminUserId = UserCommands::createUser(array(
    'id' => '',
    'name' => $constants['adminName'],
    'email' => $constants['adminEmail'],
    'username' => $constants['adminUsername'],
    'password' => $constants['adminPassword'],
    'active' => true,
    'role' => SystemRoles::SYSTEM_ADMIN),
    $website
);
$managerUserId = UserCommands::createUser(array(
    'id' => '',
    'name' => $constants['managerName'],
    'email' => $constants['managerEmail'],
    'username' => $constants['managerUsername'],
    'password' => $constants['managerPassword'],
    'active' => true,
    'role' => SystemRoles::USER),
    $website
);
$memberUserId = UserCommands::createUser(array(
    'id' => '',
    'name' => $constants['memberName'],
    'email' => $constants['memberEmail'],
    'username' => $constants['memberUsername'],
    'password' => $constants['memberPassword'],
    'active' => true,
    'role' => SystemRoles::USER),
    $website
);
$expiredUserId = UserCommands::createUser(array(
    'id' => '',
    'name' => $constants['expiredName'],
    'email' => $constants['expiredEmail'],
    'username' => $constants['expiredUsername'],
    'password' => $constants['memberPassword'], // intentionally set wrong password
    'active' => true,
    'role' => SystemRoles::USER),
    $website
);
$resetUserId = UserCommands::createUser(array(
    'id' => '',
    'name' => $constants['resetName'],
    'email' => $constants['resetEmail'],
    'username' => $constants['resetUsername'],
    'password' => $constants['memberPassword'], // intentionally set wrong password
    'active' => true,
    'role' => SystemRoles::USER),
    $website
);
$observerUserId = UserCommands::createUser(array(
    'id' => '',
    'name' => $constants['observerName'],
    'email' => $constants['observerEmail'],
    'username' => $constants['observerUsername'],
    'password' => $constants['observerPassword'],
    'active' => true,
    'role' => SystemRoles::USER),
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
if ($site == 'scriptureforge') {
    $projectType = SfProjectModel::SFCHECKS_APP;
} else if ($site == 'languageforge') {
    $projectType = LfProjectModel::LEXICON_APP;
}
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

$srProject = array(
    'identifier' => $constants['srIdentifier'],
    'name' => $constants['srName'],
    'repository' => 'http://public.languagedepot.org',
    'role' => 'manager'
);
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
ProjectCommands::updateUserRole($testProjectId, $resetUserId, ProjectRoles::CONTRIBUTOR);
ProjectCommands::updateUserRole($otherProjectId, $adminUserId, ProjectRoles::MANAGER);
ProjectCommands::updateUserRole($fourthProjectId, $adminUserId, ProjectRoles::MANAGER);
ProjectCommands::updateUserRole($srTestProjectId, $adminUserId, ProjectRoles::MANAGER);

if ($site == 'scriptureforge') {
    $text1 = TextCommands::updateText($testProjectId, array(
        'id' => '',
        'title' => $constants['testText1Title'],
        'content' => $constants['testText1Content']
    ));
    $text2 = TextCommands::updateText($testProjectId, array(
        'id' => '',
        'title' => $constants['testText2Title'],
        'content' => $constants['testText2Content']
    ));

    $question1 = QuestionCommands::updateQuestion($testProjectId, array(
        'id' => '',
        'textRef' => $text1,
        'title' => $constants['testText1Question1Title'],
        'description' => $constants['testText1Question1Content']
    ));
    $question2 = QuestionCommands::updateQuestion($testProjectId, array(
        'id' => '',
        'textRef' => $text1,
        'title' => $constants['testText1Question2Title'],
        'description' => $constants['testText1Question2Content']
    ));

    $template1 = QuestionTemplateCommands::updateTemplate($testProjectId, array(
        'id' => '',
        'title' => 'first template',
        'description' => 'not particularly interesting'
            ));

    $template2 = QuestionTemplateCommands::updateTemplate($testProjectId, array(
        'id' => '',
        'title' => 'second template',
        'description' => 'not entirely interesting'
            ));

    $answer1 = QuestionCommands::updateAnswer($testProjectId, $question1, array(
        'id' => '',
        'content' => $constants['testText1Question1Answer']),
        $managerUserId);
    $answer1Id = array_keys($answer1)[0];
    $answer2 = QuestionCommands::updateAnswer($testProjectId, $question2, array(
        'id' => '',
        'content' => $constants['testText1Question2Answer']),
        $managerUserId);
    $answer2Id = array_keys($answer2)[0];

    $comment1 = QuestionCommands::updateComment($testProjectId, $question1, $answer1Id, array(
        'id' => '',
        'content' => $constants['testText1Question1Answer1Comment']),
        $managerUserId);
    $comment2 = QuestionCommands::updateComment($testProjectId, $question2, $answer2Id, array(
        'id' => '',
        'content' => $constants['testText1Question2Answer2Comment']),
        $managerUserId);
} elseif ($site == 'languageforge') {
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
    $file = array();
    $file['name'] = $fileName;
    $_FILES['file'] = $file;

    // put a copy of the test file in tmp
    $tmpFilePath = sys_get_temp_dir() . "/CopyOf$fileName";
    copy(TestPath . "php/common/$fileName", $tmpFilePath);

    $response = LexUploadCommands::uploadAudioFile($testProjectId, 'audio', $tmpFilePath);

    // cleanup tmp file if it still exists
    if (file_exists($tmpFilePath) and ! is_dir($tmpFilePath)) {
        @unlink($tmpFilePath);
    }

    // put uploaded file into entry1
    $constants['testEntry1']['lexeme']['th-Zxxx-x-audio']['value'] = $response->data->fileName;

    // setup to mimic file upload
    $fileName = $constants['testEntry1']['senses'][0]['pictures'][0]['fileName'];
    $file = array();
    $file['name'] = $fileName;
    $_FILES['file'] = $file;

    // put a copy of the test file in tmp
    $tmpFilePath = sys_get_temp_dir() . "/CopyOf$fileName";
    copy(TestPath . "php/common/$fileName", $tmpFilePath);

    $response = LexUploadCommands::uploadImageFile($testProjectId, 'sense-image', $tmpFilePath);

    // cleanup tmp file if it still exists
    if (file_exists($tmpFilePath) and ! is_dir($tmpFilePath)) {
        @unlink($tmpFilePath);
    }

    // put uploaded file into entry1
    $constants['testEntry1']['senses'][0]['pictures'][0]['fileName'] = $response->data->fileName;

    $entry1 = LexEntryCommands::updateEntry($testProjectId,
        array(
            'id' => '',
            'lexeme' => $constants['testEntry1']['lexeme'],
            'senses' => $constants['testEntry1']['senses']
        ), $managerUserId);
    $entry2 = LexEntryCommands::updateEntry($testProjectId,
        array(
            'id' => '',
            'lexeme' => $constants['testEntry2']['lexeme'],
            'senses' => $constants['testEntry2']['senses']
        ), $managerUserId);
    $multipleMeaningEntry1 = LexEntryCommands::updateEntry($testProjectId,
        array(
            'id' => '',
            'lexeme' => $constants['testMultipleMeaningEntry1']['lexeme'],
            'senses' => $constants['testMultipleMeaningEntry1']['senses']
        ), $managerUserId);

    // put mock uploaded zip import (jpg file)
    $fileName = $constants['testMockJpgImportFile']['name'];
    $tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
    copy(TestPath . "php/common/$fileName", $tmpFilePath);

    // put mock uploaded zip import (zip file)
    $fileName = $constants['testMockZipImportFile']['name'];
    $tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
    copy(TestPath . "php/common/$fileName", $tmpFilePath);

    // put mock uploaded audio (png file)
    $fileName = $constants['testMockPngUploadFile']['name'];
    $tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
    copy(TestPath . "php/common/$fileName", $tmpFilePath);

    // put mock uploaded audio (mp3 file)
    $fileName = $constants['testMockMp3UploadFile']['name'];
    $tmpFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
    copy(TestPath . "php/common/$fileName", $tmpFilePath);
}
