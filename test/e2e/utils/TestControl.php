<?php

namespace Api\Service;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\Command\ErrorResult;
use Api\Model\Shared\Command\MediaResult;
use Api\Model\Shared\Command\UploadResponse;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserModelWithPassword;
use Api\Model\Languageforge\Lexicon\Guid;
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
use Api\Model\Languageforge\Lexicon\Command\LexUploadCommands;
use Palaso\Utilities\FileUtilities;
use Api\Library\Shared\UrlHelper;

use Silex\Application;

require_once APPPATH . "vendor/autoload.php";

class TestControl
{
    public function __construct(Application $app)
    {
        $this->app = $app;
        // $rootPath = realpath(__DIR__.'/../../');

        // $TestPath = $rootPath.'/test/';
        // $this->constants = json_decode(file_get_contents($TestPath . 'app/testConstants.json'), true);
    }

    /** @var Application */
    private $app;

    public function checkPermissions($methodName)
    {
        // Do nothing; all methods are allowed
    }

    public function checkPermissionsWithParams($methodName, $params = null)
    {
        // Do nothing; all methods are allowed
    }

    // -------------------- API COMMANDS --------------------

    public function check_test_api()
    {
        return ["api_is_working" => true];
    }

    public function create_user($username, $humanName = null, $password = null, $email = null)
    {
        if (!$password) {
            $password = "x";
        }
        if (!$email) {
            $email = $username . "@example.com";
        }
        if (!$humanName) {
            $humanName = ucwords(str_replace("_", " ", $username));
        }

        // TODO: Handle this with MongoStore instead of through Commands library
        $userId = UserCommands::createUser([
            "name" => $humanName,
            "email" => $email,
            "password" => $password,
        ]);

        UserCommands::updateUser([
            "id" => $userId,
            "name" => $humanName,
            "email" => $email,
            "username" => $username,
            "password" => $password,
            "active" => true,
            "languageDepotUsername" => $username,
            "role" => strpos($username, "admin") === false ? SystemRoles::USER : SystemRoles::SYSTEM_ADMIN,
        ]);

        return $userId;
    }

    public function change_password($username, $password)
    {
        $user = new UserModelWithPassword();
        if ($user->readByUserName($username)) {
            $user->changePassword($password);
            return $user->write();
        }
        return "";
    }

    public function get_reset_password_key($usernameOrEmail)
    {
        $user = new UserModelWithPassword();
        if ($user->readByUsernameOrEmail($usernameOrEmail)) {
            return $user->resetPasswordKey;
        }
        return "";
    }

    public function expire_and_get_reset_password_key($usernameOrEmail)
    {
        $user = new UserModelWithPassword();
        if ($user->readByUsernameOrEmail($usernameOrEmail)) {
            $user->resetPasswordExpirationDate = new \DateTime();
            $user->write();
            return $user->resetPasswordKey;
        }
        return "";
    }

    public function reset_projects()
    {
        $db = MongoStore::connect(DATABASE);
        $db->dropCollection("projects");
        return true;
    }

    public function init_test_project(
        $projectCode = null,
        $projectName = null,
        $ownerUsername = null,
        $memberUsernames = []
    ) {
        if (!$projectCode) {
            $projectCode = "test_project";
        }
        if (!$projectName) {
            $projectName = "Test Project";
        }

        $owner = new UserModel();
        $ownerId = "";
        if ($owner->readByUserName($ownerUsername)) {
            $ownerId = $owner->id->asString();
        } else {
            $ownerId = $this->create_user($ownerUsername);
        }

        $db = MongoStore::connect(DATABASE);
        $coll = $db->selectCollection("projects");
        $coll->deleteMany(["projectCode" => $projectCode]);
        $projectModel = new LexProjectModel();
        $projectModel->projectName = $projectName;
        $projectModel->projectCode = $projectCode;
        $projectModel->appName = LexProjectModel::LEXICON_APP;
        $projectModel->siteName = UrlHelper::getHostname();
        $projectModel->ownerRef = new IdReference($ownerId);
        $projectModel->addUser($ownerId, ProjectRoles::MANAGER);
        foreach ($memberUsernames as $username) {
            $user = new UserModel();
            if ($user->readByUserName($username)) {
                $userId = $user->id->asString();
                $projectModel->addUser($userId, ProjectRoles::CONTRIBUTOR);
                $user->addProject($projectModel->id->asString());
                $user->write();
            }
        }
        MongoStore::dropAllCollections($projectModel->databaseName());
        MongoStore::dropDB($projectModel->databaseName());
        $projectModel->write();
        $projectModel->initializeNewProject();
        // Now we know projectModel id, so now user models can be updated with membership
        foreach ($memberUsernames as $username) {
            $user = new UserModel();
            if ($user->readByUserName($username)) {
                $user->addProject($projectModel->id->asString());
                $user->write();
            }
        }
        return $projectModel->id->asString();
    }

    public function add_writing_system_to_project($projectCode, $langTag, $abbr = "", $name = "")
    {
        $project = ProjectModel::getByProjectCode($projectCode);
        $project->addInputSystem($langTag, $abbr, $name);
        $project->write();
        return $langTag;
    }

    public function add_audio_visual_file_to_project($projectCode, $tmpFilePath)
    {
        $project = ProjectModel::getByProjectCode($projectCode);
        $response = TestControl::uploadMediaFile($project, "audio", $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public function add_picture_file_to_project($projectCode, $tmpFilePath)
    {
        $project = ProjectModel::getByProjectCode($projectCode);
        $response = TestControl::uploadMediaFile($project, "sense-image", $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public static function uploadMediaFile($project, $mediaType, $tmpFilePath)
    {
        if ($mediaType != "audio" && $mediaType != "sense-image") {
            throw new \Exception("Unsupported upload type.");
        }
        if (!$tmpFilePath) {
            throw new \Exception("No file given.");
        }

        // make the folders if they don't exist
        $project->createAssetsFolders();
        $folderPath = $mediaType == "audio" ? $project->getAudioFolderPath() : $project->getImageFolderPath();

        // move uploaded file from tmp location to assets
        $filename = FileUtilities::replaceSpecialCharacters(\basename($tmpFilePath));
        $filePath = $folderPath . DIRECTORY_SEPARATOR . $filename;
        $moveOk = copy($tmpFilePath, $filePath);
        // Do NOT delete $tmpFilePath as we're doing E2E tests and probably want to keep the original around

        // construct server response
        $response = new UploadResponse();
        if ($moveOk && $tmpFilePath) {
            $data = new MediaResult();
            $assetsPath = $project->getAssetsRelativePath();
            $data->path =
                $mediaType == "audio"
                    ? $project->getAudioFolderPath($assetsPath)
                    : $project->getImageFolderPath($assetsPath);
            // NOTE: $data->fileName needs capital N so it will match what the real upload(Audio/Image)File functions return
            $data->fileName = $filename;
            $response->result = true;
        } else {
            $data = new ErrorResult();
            $data->errorType = "UserMessage";
            $data->errorMessage = "$filename could not be saved to the right location. Contact your Site Administrator.";
            $response->result = false;
        }

        $response->data = $data;
        return $response;
    }

    public function add_user_to_project($projectCode, $username, $role = null)
    {
        if (!$role) {
            $role = ProjectRoles::CONTRIBUTOR;
        }
        if ($role === "manager") {
            // Make allowances for a common mistake in role name
            $role = ProjectRoles::MANAGER;
        }

        $user = new UserModel();
        if (!$user->readByUserName($username)) {
            return false;
        }

        $project = ProjectModel::getByProjectCode($projectCode);
        if (!$project) {
            return false;
        }

        $project->addUser($user->id->asString(), $role);
        $user->addProject($project->id->asString());
        $project->write();
        $user->write();
        return true;
    }

    public function add_custom_field(
        string $projectCode,
        string $customFieldName,
        string $parentField = "entry",
        string $customFieldType = "MultiString",
        $extraOptions = null
    ) {
        error_log("add_custom_field");
        $prefix = "customField_" . $parentField . "_";
        if (\strpos($customFieldName, $prefix) !== 0) {
            $customFieldName = $prefix . $customFieldName;
        }
        $project = ProjectModel::getByProjectCode($projectCode);
        error_log($project->id->asString());
        switch ($parentField) {
            case "entry":
                $config = $project->config->entry;
                break;
            case "senses":
                $config = $project->config->entry->fields[LexConfig::SENSES_LIST];
                break;
            case "examples":
                $config = $project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST];
                break;
        }
        $config->fieldOrder->ensureValueExists($customFieldName);
        if (!array_key_exists($customFieldName, $config->fields)) {
            switch ($customFieldType) {
                case "ReferenceAtom":
                    $config->fields[$customFieldName] = new LexConfigOptionList();
                    $config->fields[$customFieldName]->listCode = $extraOptions["listCode"];
                    break;
                case "ReferenceCollection":
                    $config->fields[$customFieldName] = new LexConfigMultiOptionList();
                    $config->fields[$customFieldName]->listCode = $extraOptions["listCode"];
                    break;
                case "OwningAtom":
                    $config->fields[$customFieldName] = new LexConfigMultiParagraph();
                    break;
                default:
                    $config->fields[$customFieldName] = new LexConfigMultiText();
                    $config->fields[$customFieldName]->inputSystems = new ArrayOf();
                    if ($extraOptions["inputSystems"]) {
                        foreach ($extraOptions["inputSystems"] as $ws) {
                            $config->fields[$customFieldName]->inputSystems->ensureValueExists($ws);
                        }
                    }
            }
            $label = str_replace($prefix, "", $customFieldName);
            $config->fields[$customFieldName]->label = str_replace(" ", "_", $label);
            $config->fields[$customFieldName]->hideIfEmpty = false;
        }
        // PHP copies objects by value, not reference, so now we have to write the config back
        switch ($parentField) {
            case "entry":
                $project->config->entry = $config;
                break;
            case "senses":
                $project->config->entry->fields[LexConfig::SENSES_LIST] = $config;
                break;
            case "examples":
                $project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST] = $config;
                break;
        }

        // Now make the custom field visible in all views
        foreach ($project->config->roleViews as $role => $roleView) {
            if (!array_key_exists($customFieldName, $roleView->fields)) {
                if ($customFieldType == "MultiUnicode" || $customFieldType == "MultiString") {
                    $roleView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                } else {
                    $roleView->fields[$customFieldName] = new LexViewFieldConfig();
                }
                $roleView->fields[$customFieldName]->show = true;
            }
        }
        foreach ($project->config->userViews as $userId => $userView) {
            if (!array_key_exists($customFieldName, $userView->fields)) {
                if ($customFieldType == "MultiUnicode" || $customFieldType == "MultiString") {
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
        $entry->guid = Guid::makeValid("");
        return $entry->write();
    }

    public function get_project_json(string $projectCode)
    {
        $db = MongoStore::connect(DATABASE);
        $project = $db->projects->findOne(["projectCode" => $projectCode]);
        return $project;
    }
}
