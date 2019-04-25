<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Scriptureforge\SfProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;

class SfchecksProjectModel extends SfProjectModel
{
    public function __construct($id = '')
    {
        $this->rolesClass = 'Api\Model\Scriptureforge\Sfchecks\SfchecksRoles';
        $this->appName = SfProjectModel::SFCHECKS_APP;
        $this->usersSeeEachOthersResponses = true;
        $this->isRightToLeft = false;
        $this->fontSize = 16;

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

    public function getPublicSettings($userId)
    {
        $settings = parent::getPublicSettings($userId);
        $settings['allowAudioDownload'] = $this->allowAudioDownload;
        $settings['usersSeeEachOthersResponses'] = $this->usersSeeEachOthersResponses;

        return $settings;
    }

    public function shouldSeeOtherUsersResponses($userId)
    {
        if ($this->usersSeeEachOthersResponses) return true;
        $isManager = (
            array_key_exists($userId, $this->users) &&
            property_exists($this->users[$userId], "role") &&
            $this->users[$userId]->role == ProjectRoles::MANAGER
        );
        return $isManager;
    }

    /** @var boolean Does this project allows users to see each other's answers and comments, or just their own? */
    public $usersSeeEachOthersResponses;

    /** @var boolean (optional) Indicates if the project deals primarily with a right-to-left script.  Controls the RTL direction property
     *  for all texts in this project */
    public $isRightToLeft;

    /** @var int (optional) Specifies a font size for all texts in the project.  Some scripts may tend not to be readable at the default font size. */
    public $fontSize;
}
