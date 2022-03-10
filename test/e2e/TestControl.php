<?php

namespace Api\Service;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectModel;
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

    private $constants;

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

    public function init_test_project($projectCode = null, $projectName = null)
    {
        $constants = $this->constants;

        if (! $projectCode) {
            $projectCode = 'test_project';
        }
        if (! $projectName) {
            $projectName = 'Test Project';
        }

        // TODO: Handle this with MongoStore instead of through Commands library
        $adminUserId = UserCommands::createUser([
            'name' => 'Test Admin', // $constants['adminName'],
            'email' => 'test_runner_admin@example.com', // $constants['adminEmail'],
            'password' =>'hammertime', // $constants['adminPassword']
        ],
            $this->website
        );
        $adminUserId = UserCommands::updateUser([
            'id' => $adminUserId,
            'name' => 'Test Admin', // $constants['adminName'],
            'email' => 'test_runner_admin@example.com', // $constants['adminEmail'],
            'username' => 'test_runner_admin', // $constants['adminUsername'],
            'password' =>'hammertime', // $constants['adminPassword'],
            'active' => true,
            'languageDepotUsername' => 'admin',
            'role' => SystemRoles::SYSTEM_ADMIN
        ],
            $this->website
        );

        $db = MongoStore::connect(DATABASE);
        $db->dropCollection('projects');
        $db->createCollection('projects');
        $coll = $db->selectCollection('projects');
        $projectModel = new ProjectModel();
        $projectModel->projectName = $projectName;
        $projectModel->projectCode = $projectCode;
        $projectModel->appName = LexProjectModel::LEXICON_APP;
        $projectModel->siteName = $this->website->domain;
        $projectModel->ownerRef = new IdReference($adminUserId);
        $projectModel->addUser($adminUserId, ProjectRoles::MANAGER);
        MongoStore::dropAllCollections($projectModel->databaseName());
        MongoStore::dropDB($projectModel->databaseName());
        $projectModel->write();
        return $projectModel->id->asString();
    }
}
