<?php
use libraries\shared\Website;
use models\ProjectModel;
use models\UserModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;

require_once TestPath . 'common/MockProjectModel.php';

class MongoTestEnvironment
{

    public function __construct($domain = 'www.scriptureforge.org')
    {
        $this->db = \models\mapper\MongoStore::connect(SF_DATABASE);
        $this->website = Website::get($domain);
    }

    /**
     *
     * @var MongoDB
     */
    private $db;

    /**
     *
     * @var Website
     */
    public $website;

    /**
     * Removes all the collections from the mongo database.
     * Hopefully this is only ever called on the scriptureforge_test database.
     */
    public function clean()
    {
        foreach ($this->db->listCollections() as $collection) {
            $collection->drop();
        }
    }

    /**
     * Querys the given $collection and returns a MongoCursor.
     *
     * @param string $collection
     * @param array $query
     * @param array $fields
     * @return MongoCursor
     */
    public function find($collection, $query, $fields = array())
    {
        $collection = $this->db->$collection;

        return $collection->find($query, $fields);
    }

    /**
     * Writes a user to the users collection.
     *
     * @param string $username
     * @param string $name
     * @param string $email
     * @param string $role
     * @return string id
     */
    public function createUser($username, $name, $email, $role = SystemRoles::USER)
    {
        $userModel = new models\UserModel();
        $userModel->username = $username;
        $userModel->name = $name;
        $userModel->email = $email;
        $userModel->avatar_ref = $username . ".png";
        $userModel->role = $role;
        $userModel->siteRole[$this->website->domain] = $this->website->userDefaultSiteRole;

        return $userModel->write();
    }

    /**
     * Writes a project to the projects collection.
     *
     * @param string $name
     * @param string $code
     * @return ProjectModel
     */
    public function createProject($name, $code)
    {
        $projectModel = new ProjectModel();
        $projectModel->projectName = $name;
        $projectModel->projectCode = $code;
        $projectModel->isArchived = false;
        $projectModel->siteName = $this->website->domain;
        if ($this->website->base == Website::SCRIPTUREFORGE) {
            $projectModel->appName = 'sfchecks';
        } elseif ($this->website->base == Website::LANGUAGEFORGE) {
            $projectModel->appName = 'lexicon';
        } else {
            $projectModel->appName = 'rapuma';
        }
        $this->cleanProjectEnvironment($projectModel);
        $projectModel->write();

        return $projectModel;
    }

    public function createProjectSettings($code)
    {
        $projectModel = new models\ProjectSettingsModel();
        $projectModel->projectCode = $code;
        $projectModel->siteName = $this->website->domain;
        $this->cleanProjectEnvironment($projectModel);
        $projectModel->write();

        return $projectModel;
    }

    protected function cleanProjectEnvironment($projectModel)
    {
        // clean out old db if it is present
        $projectDb = \models\mapper\MongoStore::connect($projectModel->databaseName());
        foreach ($projectDb->listCollections() as $collection) {
            $collection->drop();
        }
        // clean up assets folder
        $folderPath = $projectModel->getAssetsFolderPath();
        $cleanupFiles = glob($folderPath . '/*');
        foreach ($cleanupFiles as $cleanupFile) {
            @unlink($cleanupFile);
        }
        @rmdir($folderPath);
    }

    /**
     * Returns a string very much like those used for MongoIds
     *
     * @return string
     */
    public static function mockId()
    {
        $id = new MongoId();

        return (string) $id;
    }

    /**
     * Returns a string of utf-8 usx xml
     *
     * @return string
     */
    public static function usxSample()
    {
        global $rootPath;
        $testFilePath = $rootPath . 'docs/usx/043JHN.usx';
        $usx = file_get_contents($testFilePath);

        return $usx;
    }

    public static function usxSampleWithNotes()
    {
        global $rootPath;
        $testFilePath = $rootPath . 'docs/usx/CEV_PSA001.usx';
        $usx = file_get_contents($testFilePath);

        return $usx;
    }

    public function inhibitErrorDisplay()
    {
        $this->_display = ini_get('display_errors');
        ini_set('display_errors', false);
    }

    public function restoreErrorDisplay()
    {
        ini_set('display_errors', $this->_display);
    }

    public function fixJson($input)
    {
        return json_decode(json_encode($input), true);
    }
}

class LexiconMongoTestEnvironment extends MongoTestEnvironment
{

    public function __construct()
    {
        if (! isset($this->liftFilePaths)) {
            $this->liftFilePaths = array();
        }
        parent::__construct('languageforge.org');
    }

    /**
     * Local store of created lift filepaths
     *
     * @var array
     */
    private $liftFilePaths;

    public function createProject($name, $code)
    {
        $projectModel = new LexiconProjectModel();
        $projectModel->projectName = $name;
        $projectModel->projectCode = $code;
        $projectModel->siteName = $this->website->domain;
        $this->cleanProjectEnvironment($projectModel);
        $projectModel->write();

        return $projectModel;
    }

    public function getProjectMember($projectId, $userName)
    {
        new UserModel();

        $userId = $this->createUser($userName, $userName, 'user@example.com');
        $user = new UserModel($userId);
        $user->addProject($projectId);
        $user->write();
        $project = new ProjectModel($projectId);
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        return $userId;
    }

    /**
     * Simulate the upload of a LIFT file
     *
     * @param unknown $liftXml
     * @param unknown $fileName
     * @param unknown $mergeRule
     * @param string $skipSameModTime
     * @param string $deleteMatchingEntry
     * @return string
     */
    public function uploadLiftFile($liftXml, $fileName, $mergeRule, $skipSameModTime = false, $deleteMatchingEntry = false)
    {
        $_FILES['file'] = array();
        $_FILES['file']['name'] = $fileName;
        $_POST['mergeRule'] = $mergeRule;
        $_POST['skipSameModTime'] = $skipSameModTime;
        $_POST['deleteMatchingEntry'] = $deleteMatchingEntry;

        return $this->createTestLiftFile($liftXml, $fileName);
    }

    /**
     * Put a copy of the test lift file in system tmp folder
     *
     * @param string $liftXml
     * @param string $fileName
     * @return string $liftFilePath
     */
    public function createTestLiftFile($liftXml, $fileName)
    {
        $liftFilePath = sys_get_temp_dir() . '/' . $fileName;
        file_put_contents($liftFilePath, $liftXml);
        if (! array_key_exists($liftFilePath, $this->liftFilePaths)) {
            $this->liftFilePaths[] = $liftFilePath;
        }

        return $liftFilePath;
    }

    /**
     * Cleanup test lift files
     */
    public function cleanupTestLiftFiles()
    {
        foreach ($this->liftFilePaths as $liftFilePath) {
            if (file_exists($liftFilePath) and ! is_dir($liftFilePath)) {
                @unlink($liftFilePath);
            }
        }
        $this->liftFilePaths = array();
    }
}
