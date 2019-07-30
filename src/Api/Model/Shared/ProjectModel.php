<?php

namespace Api\Model\Shared;

use Api\Library\Shared\Website;
use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Languageforge\Semdomtrans\SemDomTransProjectModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransRoles;
use Api\Model\Scriptureforge\Rapuma\RapumaProjectModel;
use Api\Model\Scriptureforge\Rapuma\RapumaRoles;
use Api\Model\Scriptureforge\Sfchecks\ProjectUserPropertiesSettings;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\Sfchecks\SfchecksRoles;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\InviteToken;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MapperUtils;
use Api\Model\Shared\Rights\ProjectRoleModel;
use Api\Model\Shared\Translate\TranslateProjectModel;
use Palaso\Utilities\CodeGuard;
use Palaso\Utilities\FileUtilities;

class ProjectModel extends MapperModel
{
    // define shared project types here
    const TRANSLATE_APP = 'translate';

    public function __construct($id = '')
    {
        $this->id = new Id();
        $this->ownerRef = new IdReference();
        $this->users = new MapOf(function() {
            return new ProjectRoleModel();
        });

        $this->userJoinRequests = new MapOf(function() {
            return new ProjectRoleModel();
        });

        $this->isArchived = false;
        $this->userProperties = new ProjectUserPropertiesSettings();
        $this->allowAudioDownload = true;
        $this->allowInviteAFriend = true;
        $this->interfaceLanguageCode = 'en';

        $this->inviteToken = new InviteToken();

        $this->setReadOnlyProp('id');
        $this->setReadOnlyProp('ownerRef');
        $this->setReadOnlyProp('users');
        $this->setReadOnlyProp('projectCode');
        $this->setReadOnlyProp('siteName');
        $this->setReadOnlyProp('appName');

        // There's separate API calls to get/set $userJoinRequests
        // TODO: Add API calls for $usersRequestingAccess DDW 2016-09
        $this->setPrivateProp('userJoinRequests');
        $this->setPrivateProp('usersRequestingAccess');

        parent::__construct(ProjectModelMongoMapper::instance(), $id);
    }

    /** @var Id */
    public $id;

    /** @var IdReference ID of the user that created the project */
    public $ownerRef;

    /** @var string */
    public $projectName;

    /** @var string Web app interface language code */
    public $interfaceLanguageCode;

    /** @var string */
    // TODO move this to a subclass cjh 2014-02
    public $language;

    /** @var MapOf<ProjectRoleModel> */
    public $users;

    /** @var MapOf<ProjectRoleModel> */
    public $userJoinRequests;

    /** @var string A string representing exactly this project from external sources. Typically some part of the URL. */
    public $projectCode;

    /** @var boolean Flag to indicated if this project is featured on the website */
    public $featured;

    /** @var boolean Flag to indicate if this project allows users to download audio files */
    public $allowAudioDownload;

    /** @var boolean Flag to indicate if this project allows users to invite a friend */
    public $allowInviteAFriend;

    /** @var InviteToken Stores the information about the projects invitation link */
    public $inviteToken;

    /** @var boolean Flag to indicate if this project is archived */
    public $isArchived;

    /** @var ProjectUserPropertiesSettings */
    public $userProperties;

    /**
     * Specifies which site this project belongs to e.g. scriptureforge || languageforge, cf. Website class
     * @var string
     */
    public $siteName;

    /**
     * Specifies the angular app this project is associated with e.g. sfchecks || lexicon (note: these apps are site specific)
     * @var string
     */
    public $appName;

    /** @var ArrayOf */
    public $usersRequestingAccess;

    /** @var LexRoles|SfchecksRoles|SemDomTransRoles|RapumaRoles */
    protected $rolesClass;

    /**
     * @param Website $website
     * @return ProjectModel
     * @throws \Exception
     */
    public static function getDefaultProject($website)
    {
        $project = new ProjectModel();
        if ($project->readByProperties(array('projectCode' => $website->defaultProjectCode, 'siteName' => $website->domain))) {
            return ProjectModel::getById($project->id->asString());
        } else {
            return null;
        }
    }

    /**
     * @param string $projectId
     * @param Website $website
     * @return bool
     * @throws \Exception
     */
    public static function projectExistsOnWebsite($projectId, $website) {
        $projectExists = false;
        $projectModel = new ProjectModel();
        if ($projectModel->exists($projectId)) {
            $projectModel = ProjectModel::getById($projectId);
            $projectExists = ($website->domain == $projectModel->siteName);
        }
        return $projectExists;
    }

    /**
     * Reads the model from the mongo collection
     * Ensures that the required pick lists exist even if not present in the database
     * @param string $id
     * @throws \Exception
     * @see MapperModel::read()
     */
    public function read($id)
    {
        parent::read($id);
        $this->userProperties->ensurePickListsExist();
    }

    /**
     * (non-PHPdoc)
     * @see MapperModel::databaseName()
     */
    public function databaseName()
    {
        CodeGuard::checkEmptyAndThrow($this->projectCode, 'projectCode');
        $name = strtolower($this->projectCode);
        $name = str_replace(' ', '_', $name);

        return 'sf_' . $name;
    }

    /**
     * Removes this project from the collection.
     * User references to this project are also removed
     */
    public function remove()
    {
        foreach ($this->users as $userId => $roleObj) {
            $user = new UserModel($userId);
            $user->removeProject($this->id->asString());
            $user->write();
        }
        $this->cleanup();

        MapperUtils::dropAllCollections($this->databaseName());
        MapperUtils::drop($this->databaseName());
        ProjectModelMongoMapper::instance()->remove($this->id->asString());
    }

    /**
     * Adds the $userId as a member of this project.
     * @param string $userId
     * @param string $role The system role the user has.
     * @see Roles;
     */
    public function addUser($userId, $role)
    {
        ProjectModelMongoMapper::instance();
//        $ProjectModelMongoMapper::mongoID($userId)
        $model = new ProjectRoleModel();
        $model->role = $role;
        $this->users[$userId] = $model;
    }

    /**
     * Adds the $userId as a member of this project.
     * @param string $userId
     * @see Roles;
     */
    public function addUserByInviteToken($userId)
    {
        $rolesArray = $this->getRolesList();
        $validRole = array_key_exists($this->inviteToken->defaultRole, $rolesArray);
        if(!$validRole)
        {
            throw new ResourceNotAvailableException('Project ' . $projectId . '\'s invite token is associated with nonexistant role '
                . $model->inviteToken->defaultRole);
        }
        $this->addUser($userId, $this->inviteToken->defaultRole);
    }

    /**
     * Creates a user join request by adding the $userID to the join request array on the project
     * @param string $userId
     * @param string $role the system role the user has
     * @see roles
     */
    public function createUserJoinRequest($userId, $role) {
        ProjectModelMongoMapper::instance();
        $model = new ProjectRoleModel();
        $model->role = $role;
        $this->userJoinRequests[$userId] = $model;
    }

    /**
     * Removes the $userId from this project.
     * @param string $userId
     */
    public function removeUser($userId)
    {
        if (array_key_exists($userId, $this->users)) {
            unset($this->users[$userId]);
        }
    }

    /**
     * Removes the $userId from this project.
     * @param string $userId
     */
    public function removeUserJoinRequest($userId)
    {
        if (array_key_exists($userId, $this->userJoinRequests)) {
            unset($this->userJoinRequests[$userId]);
        }
    }

    /**
     * @param string $userId
     * @return bool
     */
    public function userIsMember($userId)
    {
        return $this->users->offsetExists($userId);
    }

    public function listUsers()
    {
        $userList = new UserListProjectModel($this->id->asString());
        $userList->read();
        for ($i = 0, $l = count($userList->entries); $i < $l; $i++) {
            $userId = $userList->entries[$i]['id'];
            if (!array_key_exists($userId, $this->users)) {
                continue;
            }
            $userList->entries[$i]['role'] = $this->users[$userId]->role;
        }
         return $userList;
    }

    public function listInvitees()
    {
        $invitees = new InviteeListProjectModel($this->id->asString());
        $invitees->read();
        foreach ($invitees->entries as $i => $invitee) {
            if (array_key_exists($invitee['id'], $this->users)) {
                $invitees->entries[$i]['role'] = $this->users[$invitee['id']]->role;
            }
        }
        return $invitees;
    }

    public function listRequests()
    {
        $allUserList = UserCommands::listUsers();
        $userList = [];
        for ($i = 0, $l = count($allUserList->entries); $i < $l; $i++) {
            $userId = $allUserList->entries[$i]['id'];
            if (array_key_exists($userId, $this->userJoinRequests)) {
                $userList[$i] = array(
                                      "user"=> $allUserList->entries[$i],
                                      "role"=> $this->userJoinRequests[$userId]
                                     );
            }
        }
        return $userList;
    }

    /**
     * @return string the invite token stored in the db for the project
     */
    public function generateNewInviteToken()
    {
        $newToken = uniqid();
        $this->inviteToken->token = $newToken;
        return $newToken;
    }

    /**
     * @param string $newRole role to set users joining the project via the link to
     * @throws \InvalidArgumentException
     */
    public function setInviteTokenDefaultRole($newRole)
    {
        $validRoles = $this->getRolesList();
        if (array_key_exists($newRole, $validRoles)) {
            $this->inviteToken->defaultRole = $newRole;
        } else {
            throw new \InvalidArgumentException("A nonexistant role tried to be linked to an invite token.");
        }
    }

    /**
     * Returns true if the given $userId is the owner of this project
     * @param string $userId
     * @return bool
     */
    public function isOwner($userId) {
        return $this->ownerRef->asString() == $userId;
    }

    /**
     * Returns true if the given $userId has the $right in this project.
     * @param string $userId
     * @param int $right
     * @return bool
     * @throws \Exception
     */
    public function hasRight($userId, $right)
    {
        if (!method_exists($this->rolesClass, 'hasRight')) {
            throw new \Exception('hasRight method cannot be called directly from ProjectModel');
        }
        $hasRight = false;
        if (key_exists($userId, $this->users->getArrayCopy())) {
            $rolesClass = $this->rolesClass;
            $hasRight = $rolesClass::hasRight($this->users[$userId]->role, $right);
        }
        return $hasRight;
    }

    /**
     * Returns an array of key/value Roles that this project supports
     * @throws \Exception
     * @return array
     */
    public function getRolesList() {
        if (!method_exists($this->rolesClass, 'hasRight')) {
            throw new \Exception('hasRight method cannot be called directly from ProjectModel');
        }
        $rolesClass = $this->rolesClass;
        return $rolesClass::getRolesList();
    }

    /**
     * Returns the rights array for the $userId role.
     * @param string $userId
     * @return array
     * @throws \Exception
     */
    public function getRightsArray($userId)
    {
        if (!method_exists($this->rolesClass, 'getRightsArray')) {
            throw new \Exception('getRightsArray method cannot be called directly from ProjectModel');
        }
        CodeGuard::checkTypeAndThrow($userId, 'string');
        if (!key_exists($userId, $this->users->getArrayCopy())) {
            $result = array();
        } else {
            $role = $this->users[$userId]->role;
            $rolesClass = $this->rolesClass;
            $result = $rolesClass::getRightsArray($role);
        }
        return $result;
    }

    /**
     * Returns the "public" settings of this project (the ones that everyone
     * is allowed to see, with no security concerns)
     * Base classes should expand on this to add more settings
     * @param string $userId
     * @return array
     */
    public function getPublicSettings(
        /** @noinspection PhpUnusedParameterInspection used in inherited methods */
        $userId)
    {
        $settings = array(
            "allowInviteAFriend" => $this->allowInviteAFriend,
        );
        return $settings;
    }

    /**
     * @return bool
     */
    public function hasId() {
        return $this->id->asString() != '';
    }

    /**
     * @param string $projectId
     * @return ProjectModel
     * @throws \ResourceNotAvailableException
     */
    public static function getById($projectId)
    {
        $project = new ProjectModel($projectId);
        switch ($project->appName) {
            case 'sfchecks':
                return new SfchecksProjectModel($projectId);
            case 'rapuma':
                return new RapumaProjectModel($projectId);
            case 'lexicon':
                return new LexProjectModel($projectId);
            case 'translate':
                return new TranslateProjectModel($projectId);
            case 'semdomtrans':
                return new SemDomTransProjectModel($projectId);
            default:
                throw new ResourceNotAvailableException(
                    "projectId '$projectId' could not be found when calling ProjectModel::getById()");
        }
    }

    /**
     * @param string $token
     * @return ProjectModel
     * @throws ResourceNotAvailableException
     */
    public static function getIdByInviteToken($token)
    {
        $model = new ProjectModel();
        $model->readByProperty('inviteToken.token', $token);
        switch ($model->appName) {
            case 'sfchecks':
            case 'rapuma':
            case 'lexicon':
            case 'translate':
            case 'semdomtrans':
                return $model->id->id;
            default:
                throw new ResourceNotAvailableException(
                    "inviteToken '$token' could not be found when calling ProjectModel::getIdByInviteToken()");
        }
    }

    /**
     * @param $projectCode
     * @return ProjectModel
     * @throws \Exception
     */
    public static function getByProjectCode($projectCode)
    {
        $m = new ProjectModel();
        $m->readByProperties(array('projectCode' => $projectCode));
        if ($m->hasId()) {
            return self::getById($m->id->asString());
        }
        return $m; // empty project
    }

    /**
     * @return string Relative path of the projects assets folder
     */
    public function getAssetsRelativePath()
    {
        return 'assets/' . $this->appName. '/' . $this->databaseName();
    }

    /**
     * @return string Full path of the projects assets folder
     */
    public function getAssetsFolderPath()
    {
        $folderPath = APPPATH . $this->getAssetsRelativePath();
        FileUtilities::createAllFolders($folderPath);
        return $folderPath;
    }

    /**
     * @return Website
     */
    public function website()
    {
        return Website::get($this->siteName);
    }

    public function initializeNewProject()
    {
        // this method should be overridden by child classes
    }

    /**
     * Cleanup assets folder upon project deletion
     */
    protected function cleanup()
    {
        FileUtilities::removeFolderAndAllContents($this->getAssetsFolderPath());
    }
}
