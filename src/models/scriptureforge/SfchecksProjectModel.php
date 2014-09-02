<?php

namespace models\scriptureforge;

class SfchecksProjectModel extends SfProjectModel
{
    public function __construct($id = '')
    {
        parent::__construct($id);
        $this->rolesClass = 'models\scriptureforge\sfchecks\SfchecksRoles';
        $this->appName = SfProjectModel::SFCHECKS_APP;
    }

    public function getPublicSettings($userId)
    {
        $settings = parent::getPublicSettings($userId);
        $settings['allowAudioDownload'] = $this->allowAudioDownload;

        return $settings;
    }

}
