<?php

namespace Api\Model\Scriptureforge;

class SfchecksProjectModel extends SfProjectModel
{
    public function __construct($id = '')
    {
        $this->rolesClass = 'Api\Model\Scriptureforge\Sfchecks\SfchecksRoles';
        $this->appName = SfProjectModel::SFCHECKS_APP;

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

    public function getPublicSettings($userId)
    {
        $settings = parent::getPublicSettings($userId);
        $settings['allowAudioDownload'] = $this->allowAudioDownload;

        return $settings;
    }

}
