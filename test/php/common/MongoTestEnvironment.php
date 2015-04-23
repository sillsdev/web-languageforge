<?php
use libraries\shared\Website;
use models\mapper\Id;
use Palaso\Utilities\FileUtilities;
use models\languageforge\lexicon\LexiconProjectModel;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;
use models\ProjectModel;
use models\UserModel;
use libraries\languageforge\semdomtrans\SemDomXMLImporter;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\commands\SemDomTransProjectCommands;
use models\mapper\ArrayOf;
use models\languageforge\LfProjectModel;
use models\commands\ProjectCommands;

class MongoTestEnvironment
{

    public function __construct($domain = 'scriptureforge.org')
    {
        $this->db = \models\mapper\MongoStore::connect(SF_DATABASE);
        $this->website = Website::get($domain);
        if (! isset($this->uploadFilePaths)) {
            $this->uploadFilePaths = array();
        }
    }

    /**
     *
     * @var MongoDB
     */
    private $db;

    /**
     * Local store of 'uploaded' filepaths
     *
     * @var array
     */
    protected $uploadFilePaths;

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
        $userModel->active = true;
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
    public function createProject($name, $code, $appName = '')
    {
        $projectModel = new ProjectModel();
        $projectModel->projectName = $name;
        $projectModel->projectCode = $code;
        $projectModel->isArchived = false;
        $projectModel->siteName = $this->website->domain;
        if ($appName != '') {
            $projectModel->appName = $appName;
        }  else if ($this->website->base == Website::SCRIPTUREFORGE) {
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

    /**
     * Index items by given key
     *
     * @param unknown $items
     * @param string $byKey
     * @return array<unknown>
     */
    public static function indexItemsBy($items, $byKey = 'guid')
    {
        $indexes = array();
        foreach ($items as $item) {
            $indexes[$item[$byKey]] = $item;
        }
        return $indexes;
    }

    /**
     * Simulate the upload of a Text audio file
     *
     * @param string $filePathToCopy
     * @param string $fileName
     * @param string $textId
     * @return string $tmpFilePath
     */
    public function uploadTextAudioFile($filePathToCopy, $fileName, $textId)
    {
        $_FILES['file'] = array();
        $_FILES['file']['name'] = $fileName;
        $_POST['textId'] = $textId;

        return $this->copyTestUploadFile($filePathToCopy);
    }

    /**
     * Simulate the upload of a file
     *
     * @param string $filePathToCopy
     * @param string $fileName
     * @return string $tmpFilePath
     */
    public function uploadFile($filePathToCopy, $fileName)
    {
        $_FILES['file'] = array();
        $_FILES['file']['name'] = $fileName;

        return $this->copyTestUploadFile($filePathToCopy);
    }

    /**
     * Put a copy of the test file in system tmp folder
     *
     * @param string $filePath
     * @return string $tmpFilePath
     */
    public function copyTestUploadFile($filePath)
    {
        $fileName = basename($filePath);
        $tmpFilePath = sys_get_temp_dir() . "/CopyOf$fileName";
        copy($filePath, $tmpFilePath);
        if (! array_key_exists($tmpFilePath, $this->uploadFilePaths)) {
            $this->uploadFilePaths[] = $tmpFilePath;
        }

        return $tmpFilePath;
    }

    /**
     * Cleanup test files and folders
     *
     * @param string $assetsFolderPath
     */
    public function cleanupTestFiles($assetsFolderPath)
    {
        $this->cleanupTestUploadFiles();
        FileUtilities::removeFolderAndAllContents($assetsFolderPath);
    }

    /**
     * Cleanup test (simulated) uploaded files
     */
    public function cleanupTestUploadFiles()
    {
        foreach ($this->uploadFilePaths as $uploadFilePath) {
            if (file_exists($uploadFilePath) and ! is_dir($uploadFilePath)) {
                @unlink($uploadFilePath);
            }
        }
        $this->uploadFilePaths = array();
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
        parent::__construct('languageforge.org');
    }

    /**
     *
     * @var LexiconProjectModel
     */
    public $project;

    /**
     * @param string $name
     * @param string $code
     * @param string $appName - included only to make the signature the same as the parent
     * @return LexiconProjectModel
     */
    public function createProject($name, $code , $appName = '')
    {
        $projectModel = new LexiconProjectModel();
        $projectModel->projectName = $name;
        $projectModel->projectCode = $code;
        $projectModel->siteName = $this->website->domain;
        $this->cleanProjectEnvironment($projectModel);
        $projectModel->write();
        $this->project = $projectModel;

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
     * @param string $liftXml
     * @param string $fileName
     * @param LiftMergeRule $mergeRule
     * @param string $skipSameModTime
     * @param string $deleteMatchingEntry
     * @return string $tmpFilePath
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
        if (! array_key_exists($liftFilePath, $this->uploadFilePaths)) {
            $this->uploadFilePaths[] = $liftFilePath;
        }

        return $liftFilePath;
    }
}


class SemDomMongoTestEnvironment extends MongoTestEnvironment
{
    public function __construct()
    {
        $this->semdomVersion = self::TESTVERSION;
        parent::__construct('languageforge.org');
    }

    const TESTVERSION = 1000;

     /**
     * @var UserModel
     */
    public $userId;

    public $semdomVersion;

    /**
     *
     * @var SemDomProjectModel
     */
    public static $englishProject;

    /**
     *
     * @var SemDomProjectModel
     */
    public $targetProject;

    private static function _englishProjectExists() {
        if (self::$englishProject) {
            $englishProject = new SemDomTransProjectModel();
            $englishProject->readByCode('en', self::TESTVERSION);
            if ($englishProject->id->asString() != '') {
                return true;
            }
        }
        return false;
    }

    public function getEnglishProjectAndCreateIfNecessary() {
        if (!self::_englishProjectExists()) {
            $lang = 'en';
            $this->cleanPreviousProject($lang);
            $projectCode = SemDomTransProjectModel::projectCode($lang, self::TESTVERSION);
            $project = $this->createProject("English ($lang) Semantic Domain Base Project", $projectCode, LfProjectModel::SEMDOMTRANS_APP);
            $projectModel = new SemDomTransProjectModel($project->id->asString());
            $projectModel->languageIsoCode = $lang;
            $projectModel->isSourceLanguage = true;
            $projectModel->semdomVersion = self::TESTVERSION;

            $englishXmlFilePath = TestPath . "languageforge/semdomtrans/testFiles/SemDom_en_sample.xml";
            $projectModel->importFromFile($englishXmlFilePath, true);
            $projectModel->write();
            self::$englishProject = $projectModel;
        }
        return self::$englishProject;
    }

    public function cleanPreviousProject($languageCode) {
        $p = new SemDomTransProjectModel();
        $p->readByCode($languageCode, self::TESTVERSION);
        if (!Id::isEmpty($p->id)) {
            $this->cleanProjectEnvironment($p);
        } else {
            // create the project and then clean the project environment
            $p = new SemDomTransProjectModel();
            $p->projectCode = SemDomTransProjectModel::projectCode($languageCode, self::TESTVERSION);
            $p->write();
            $this->cleanProjectEnvironment($p);
        }
        $p->remove();
    }

    public function clean() {
        self::$englishProject = null;
        parent::clean();
    }

    public function createSemDomProject($languageCode, $userId) {
        $projectId = SemDomTransProjectCommands::createProject($languageCode, $userId, $this->website, self::TESTVERSION);
        return new SemDomTransProjectModel($projectId);
    }

}
