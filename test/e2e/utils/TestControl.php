<?php

namespace Api\Service;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserModelWithPassword;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\Config\LexConfigOptionList;
use Api\Model\Languageforge\Lexicon\Config\LexConfigMultiOptionList;
use Api\Model\Languageforge\Lexicon\Config\LexConfigMultiParagraph;
use Api\Model\Languageforge\Lexicon\Config\LexConfigMultiText;
use Api\Model\Languageforge\Lexicon\Config\LexRoleViewConfig;
use Api\Model\Languageforge\Lexicon\Config\LexUserViewConfig;
use Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig;
use Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Languageforge\Lexicon\Command\LexEntryDecoder;
use Api\Model\Languageforge\Lexicon\Command\LexProjectCommands;
// use MongoDB\Client;

use Api\Library\Shared\Website;
use Silex\Application;

require_once APPPATH . 'vendor/autoload.php';

class TestControl
{
    public function __construct(Application $app)
    {
        $this->app = $app;
        $this->website = Website::get();
        // $rootPath = realpath(__DIR__.'/../../');

        // $TestPath = $rootPath.'/test/';
        // $this->constants = json_decode(file_get_contents($TestPath . 'app/testConstants.json'), true);
    }

    /** @var Application */
    private $app;

    /** @var Website */
    private $website;

    public function checkPermissions($methodName)
    {
        // Do nothing; all methods are allowed
    }

    public function checkPermissionsWithParams($methodName, $params = null) {
        // Do nothing; all methods are allowed
    }

    // -------------------- API COMMANDS --------------------

    public function check_test_api()
    {
        return ['api_is_working' => true];
    }

    public function create_user($username, $humanName = null, $password = null, $email = null)
    {
        if (! $password) {
            $password = 'x';
        }
        if (! $email) {
            $email = $username . '@example.com';
        }
        if (! $humanName) {
            $humanName = ucwords(str_replace('_', ' ', $username));
        }

        // TODO: Handle this with MongoStore instead of through Commands library
        $userId = UserCommands::createUser([
            'name' => $humanName,
            'email' => $email,
            'password' => $password
        ],
            $this->website
        );

        UserCommands::updateUser([
            'id' => $userId,
            'name' => $humanName,
            'email' => $email,
            'username' => $username,
            'password' => $password,
            'active' => true,
            'languageDepotUsername' => $username,
            'role' => strpos($username, 'admin') === false ? SystemRoles::USER : SystemRoles::SYSTEM_ADMIN,
        ],
            $this->website
        );

        return $userId;
    }

    public function change_password($username, $password)
    {
        $user = new UserModelWithPassword();
        if ($user->readByUserName($username)) {
            $user->changePassword($password);
            return $user->write();
        }
        return '';
    }

    public function reset_projects()
    {
        $db = MongoStore::connect(DATABASE);
        $db->dropCollection('projects');
        $db->createCollection('projects');
        return true;
    }

    public function init_test_project($projectCode = null, $projectName = null, $ownerUsername = null, $memberUsernames = [])
    {
        if (! $projectCode) {
            $projectCode = 'test_project';
        }
        if (! $projectName) {
            $projectName = 'Test Project';
        }

        $owner = new UserModel();
        $ownerId = '';
        if ($owner->readByUserName($ownerUsername)) {
            $ownerId = $owner->id->asString();
        } else {
            $ownerId = $this->create_user($ownerUsername);
        }

        $db = MongoStore::connect(DATABASE);
        $coll = $db->selectCollection('projects');
        $coll->deleteOne([ 'projectCode' => $projectCode ]);
        $projectModel = new ProjectModel();
        $projectModel->projectName = $projectName;
        $projectModel->projectCode = $projectCode;
        $projectModel->appName = LexProjectModel::LEXICON_APP;
        $projectModel->siteName = $this->website->domain;
        $projectModel->ownerRef = new IdReference($ownerId);
        $projectModel->addUser($ownerId, ProjectRoles::MANAGER);
        foreach ($memberUsernames as $username) {
            $user = new UserModel();
            if ($user->readByUserName($username)) {
                $userId = $user->id->asString();
                $projectModel->addUser($userId, ProjectRoles::CONTRIBUTOR);
            }
        }
        MongoStore::dropAllCollections($projectModel->databaseName());
        MongoStore::dropDB($projectModel->databaseName());
        $projectModel->write();
        return $projectModel->id->asString();
    }

    public function add_custom_field(string $projectCode, string $customFieldName, string $parentField = 'entry', string $customFieldType = 'MultiString', $extraOptions = null)
    {
        error_log('add_custom_field');
        $prefix = 'customField_' . $parentField . '_';
        if (\strpos($customFieldName, $prefix) !== 0) {
            $customFieldName = $prefix . $customFieldName;
        }
        $project = ProjectModel::getByProjectCode($projectCode);
        error_log($project->id->asString());
        switch($parentField) {
            case 'entry': $config = $project->config->entry; break;
            case 'senses': $config = $project->config->entry->fields[LexConfig::SENSES_LIST]; break;
            case 'examples': $config = $project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]; break;
        }
        $config->fieldOrder->ensureValueExists($customFieldName);
        if (! array_key_exists($customFieldName, $config->fields)) {
            switch($customFieldType) {
                case "ReferenceAtom":
                    $config->fields[$customFieldName] = new LexConfigOptionList();
                    $config->fields[$customFieldName]->listCode = $extraOptions['listCode'];
                    break;
                case "ReferenceCollection":
                    $config->fields[$customFieldName] = new LexConfigMultiOptionList();
                    $config->fields[$customFieldName]->listCode = $extraOptions['listCode'];
                    break;
                case "OwningAtom":
                    $config->fields[$customFieldName] = new LexConfigMultiParagraph();
                    break;
                default:
                    $config->fields[$customFieldName] = new LexConfigMultiText();
                    $config->fields[$customFieldName]->inputSystems = new ArrayOf();
                    if ($extraOptions['inputSystems']) {
                        foreach ($extraOptions['inputSystems'] as $ws) {
                            $config->fields[$customFieldName]->inputSystems->ensureValueExists($ws);
                        }
                    }
            };
            $label = str_replace($prefix, '', $customFieldName);
            $config->fields[$customFieldName]->label = str_replace(' ', '_', $label);
            $config->fields[$customFieldName]->hideIfEmpty = false;
        }
        // PHP copies objects by value, not reference, so now we have to write the config back
        switch($parentField) {
            case 'entry': $project->config->entry = $config; break;
            case 'senses': $project->config->entry->fields[LexConfig::SENSES_LIST] = $config; break;
            case 'examples': $project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST] = $config; break;
        }

        // Now make the custom field visible in all views
        foreach ($project->config->roleViews as $role => $roleView) {
            if (!array_key_exists($customFieldName, $roleView->fields)) {
                if ($customFieldType == 'MultiUnicode' || $customFieldType == 'MultiString') {
                    $roleView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                } else {
                    $roleView->fields[$customFieldName] = new LexViewFieldConfig();
                }
                $roleView->fields[$customFieldName]->show = true;
            }
        }
        foreach ($project->config->userViews as $userId => $userView) {
            if (!array_key_exists($customFieldName, $userView->fields)) {
                if ($customFieldType == 'MultiUnicode' || $customFieldType == 'MultiString') {
                    $userView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                } else {
                    $userView->fields[$customFieldName] = new LexViewFieldConfig();
                }
                $userView->fields[$customFieldName]->show = true;
            }
        }

        $project->write();

        return $customFieldName;
    }

    public function add_lexical_entry(string $projectCode, array $data)
    {
        $project = ProjectModel::getByProjectCode($projectCode);
        $entry = new LexEntryModel($project);
        LexEntryDecoder::decode($entry, $data);
        return $entry->write();
    }

    public function get_project_json(string $projectCode) {
        $db = MongoStore::connect(DATABASE);
        $project = $db->projects->findOne(['projectCode' => $projectCode]);
        return $project;
    }

    public function new_method() {
        return 'hello';
    }
}
