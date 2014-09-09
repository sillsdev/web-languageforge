<?php

namespace models\scriptureforge;

class SfchecksProjectModel extends SfProjectModel
{
    public function __construct($id = '')
    {
        $this->rolesClass = 'models\scriptureforge\sfchecks\SfchecksRoles';
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
