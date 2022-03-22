<?php

namespace Api\Service;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserModelWithPassword;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\Mapper\IdReference;

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

    public function init_test_project($projectCode = null, $projectName = null, $ownerUsername = null)
    {
        if (! $projectCode) {
            $projectCode = 'test_project';
        }
        if (! $projectName) {
            $projectName = 'Test Project';
        }

        // TODO: Handle this with MongoStore instead of through Commands library
        $owner = new UserModel();
        $ownerId = '';
        if ($owner->readByUserName($ownerUsername)) {
            $ownerId = $owner->id->asString();
        } else {
            $ownerId = $this->create_user($ownerUsername);
        }


        $db = MongoStore::connect(DATABASE);
        $db->dropCollection('projects');
        $db->createCollection('projects');
        $coll = $db->selectCollection('projects');
        $projectModel = new ProjectModel();
        $projectModel->projectName = $projectName;
        $projectModel->projectCode = $projectCode;
        $projectModel->appName = LexProjectModel::LEXICON_APP;
        $projectModel->siteName = $this->website->domain;
        $projectModel->ownerRef = new IdReference($ownerId);
        $projectModel->addUser($ownerId, ProjectRoles::MANAGER);
        MongoStore::dropAllCollections($projectModel->databaseName());
        MongoStore::dropDB($projectModel->databaseName());
        $projectModel->write();
        return $projectModel->id->asString();
    }
}
