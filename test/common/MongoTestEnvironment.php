<?php

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransProjectCommands;
use Api\Model\Languageforge\Semdomtrans\SemDomTransProjectModel;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\ProjectSettingsModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\UserModel;
use Palaso\Utilities\FileUtilities;
use Api\Library\Shared\UrlHelper;

class MongoTestEnvironment
{
    public function __construct()
    {
        $this->db = MongoStore::connect(DATABASE);
        $this->siteName = UrlHelper::getHostname();
        if (!isset($this->uploadFilePaths)) {
            $this->uploadFilePaths = [];
        }
    }

    /** @var MongoDB */
    private $db;

    public $siteName;

    /** @var array Local store of 'uploaded' filepaths */
    protected $uploadFilePaths;

    /**
     * Removes all the collections from the mongo database.
     * Hopefully this is only ever called on the scriptureforge_test database.
     */
    public function clean()
    {
        foreach ($this->db->listCollections() as $collectionInfo) {
            if ($collectionInfo->getName() != "system.indexes") {
                $collection = $this->db->selectCollection($collectionInfo->getName());
                $collection->drop();
            }
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
    public function find($collection, $query, $fields = [])
    {
        $collection = $this->db->selectCollection($collection);

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
        $userModel = new UserModel();
        $userModel->username = $username;
        $userModel->name = $name;
        $userModel->email = $email;
        $userModel->avatar_ref = $username . ".png";
        $userModel->role = $role;
        $userModel->active = true;
        $userModel->siteRole[$this->siteName] = SiteRoles::PROJECT_CREATOR;
        return $userModel->write();
    }

    /**
     * Writes a project to the projects collection.
     *
     * @param string $name
     * @param string $code
     * @param string $appName
     * @return ProjectModel
     */
    public function createProject($name, $code, $appName = "")
    {
        $projectModel = new ProjectModel();
        $projectModel->projectName = $name;
        $projectModel->projectCode = $code;
        $projectModel->isArchived = false;
        $projectModel->siteName = $this->siteName;
        if ($appName != "") {
            $projectModel->appName = $appName;
        } else {
            $projectModel->appName = "lexicon";
        }
        $this->cleanProjectEnvironment($projectModel);
        $projectModel->write();

        return $projectModel;
    }

    public function createProjectSettings($code)
    {
        $projectModel = new ProjectSettingsModel();
        $projectModel->projectCode = $code;
        $projectModel->siteName = $this->siteName;
        $this->cleanProjectEnvironment($projectModel);
        $projectModel->write();

        return $projectModel;
    }

    /**
     * @param ProjectModel $project
     */
    protected function cleanProjectEnvironment($project)
    {
        // clean out old db if it is present
        $projectDb = MongoStore::connect($project->databaseName());

        foreach ($projectDb->listCollections() as $collectionInfo) {
            if ($collectionInfo->getName() != "system.indexes") {
                $collection = $projectDb->selectCollection($collectionInfo->getName());
                $collection->drop();
            }
        }

        // clean up assets folder
        $folderPath = $project->getAssetsFolderPath();
        $cleanupFiles = glob($folderPath . "/*");
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
        return strval(new MongoDB\BSON\ObjectID());
    }

    /**
     * Returns a string of utf-8 usx xml
     *
     * @return string
     */
    public static function usxSample()
    {
        global $rootPath;
        $testFilePath = $rootPath . "test/common/usx/043JHN.usx";
        $usx = file_get_contents($testFilePath);

        return $usx;
    }

    public static function usxSampleWithNotes()
    {
        global $rootPath;
        $testFilePath = $rootPath . "test/common/usx/CEV_PSA001.usx";
        $usx = file_get_contents($testFilePath);

        return $usx;
    }

    /**
     * Index items by given key
     *
     * @param mixed $items
     * @param string $byKey
     * @return array<unknown>
     */
    public static function indexItemsBy($items, $byKey = "guid")
    {
        $indexes = [];
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
        $_FILES["file"] = [];
        $_FILES["file"]["name"] = $fileName;
        $_POST["textId"] = $textId;

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
        $_FILES["file"] = [];
        $_FILES["file"]["name"] = $fileName;

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
        if (!array_key_exists($tmpFilePath, $this->uploadFilePaths)) {
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
            if (file_exists($uploadFilePath) and !is_dir($uploadFilePath)) {
                @unlink($uploadFilePath);
            }
        }
        $this->uploadFilePaths = [];
    }

    public function fixJson($input)
    {
        return json_decode(json_encode($input), true);
    }
}

class TestableLexProjectModel extends LexProjectModel
{
    public function callCleanup()
    {
        $this->cleanup();
    }
}

class LexiconMongoTestEnvironment extends MongoTestEnvironment
{
    /** @var LexProjectModel */
    public $project;

    /**
     * @param string $name
     * @param string $code
     * @param string $appName - included only to make the signature the same as the parent
     * @return LexProjectModel
     */
    public function createProject($name, $code, $appName = "")
    {
        $projectModel = new TestableLexProjectModel();
        $projectModel->projectName = $name;
        $projectModel->projectCode = $code;
        $projectModel->siteName = $this->siteName;
        $this->cleanProjectEnvironment($projectModel);
        $projectModel->write();
        $this->project = $projectModel;

        return $projectModel;
    }

    public function getProjectMember($projectId, $userName)
    {
        new UserModel();

        $userId = $this->createUser($userName, $userName, "user@example.com");
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
     * @param string $mergeRule
     * @param bool $skipSameModTime
     * @param bool $deleteMatchingEntry
     * @return string $tmpFilePath
     */
    public function uploadLiftFile(
        $liftXml,
        $fileName,
        $mergeRule,
        $skipSameModTime = false,
        $deleteMatchingEntry = false
    ) {
        $_FILES["file"] = [];
        $_FILES["file"]["name"] = $fileName;
        $_POST["mergeRule"] = $mergeRule;
        $_POST["skipSameModTime"] = $skipSameModTime;
        $_POST["deleteMatchingEntry"] = $deleteMatchingEntry;

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
        $liftFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
        file_put_contents($liftFilePath, $liftXml);
        if (!array_key_exists($liftFilePath, $this->uploadFilePaths)) {
            $this->uploadFilePaths[] = $liftFilePath;
        }

        return $liftFilePath;
    }

    public function setupSendReceiveEnvironment()
    {
        $baseDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid(rand(), true);
        SendReceiveCommands::getLFMergePaths(true, $baseDir);
        mkdir($baseDir . DIRECTORY_SEPARATOR . "state", 0777, true);
        mkdir($baseDir . DIRECTORY_SEPARATOR . "webwork", 0777, true);

        return $baseDir;
    }
}

class SemDomMongoTestEnvironment extends MongoTestEnvironment
{
    public function __construct()
    {
        $this->semdomVersion = self::TESTVERSION;
        parent::__construct();
    }

    const TESTVERSION = 1000;

    /** @var UserModel */
    public $userId;

    public $semdomVersion;

    /** @var SemDomTransProjectModel */
    public static $englishProject;

    /** @var SemDomTransProjectModel */
    public $targetProject;

    private static function _englishProjectExists()
    {
        if (self::$englishProject) {
            $englishProject = new SemDomTransProjectModel();
            $englishProject->readByCode("en", self::TESTVERSION);
            if ($englishProject->id->asString() != "") {
                return true;
            }
        }
        return false;
    }

    public function getEnglishProjectAndCreateIfNecessary()
    {
        if (!self::_englishProjectExists()) {
            $lang = "en";
            $this->cleanPreviousProject($lang);
            $projectCode = SemDomTransProjectModel::projectCode($lang, self::TESTVERSION);
            $project = $this->createProject(
                "English ($lang) Semantic Domain Base Project",
                $projectCode,
                LfProjectModel::SEMDOMTRANS_APP
            );
            $projectModel = new SemDomTransProjectModel($project->id->asString());
            $projectModel->languageIsoCode = $lang;
            $projectModel->isSourceLanguage = true;
            $projectModel->semdomVersion = self::TESTVERSION;

            $englishXmlFilePath = TestPhpPath . "model/languageforge/semdomtrans/testFiles/SemDom_en_sample.xml";
            $projectModel->importFromFile($englishXmlFilePath, true);
            $projectModel->write();
            self::$englishProject = $projectModel;
        }
        return self::$englishProject;
    }

    public function cleanPreviousProject($languageCode)
    {
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

    public function clean()
    {
        self::$englishProject = null;
        parent::clean();
    }

    public function createSemDomProject($languageCode, $languageName, $userId)
    {
        $projectId = SemDomTransProjectCommands::createProject(
            $languageCode,
            $languageName,
            false,
            $userId,
            self::TESTVERSION
        );
        return new SemDomTransProjectModel($projectId);
    }
}
