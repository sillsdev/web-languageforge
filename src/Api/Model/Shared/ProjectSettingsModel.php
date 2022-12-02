<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Communicate\EmailSettings;

/**
 * This class is separate from the ProjectModel to protect the smsSettings and emailSettings which are managed
 * by the site administrator only.
 */
class ProjectSettingsModel extends ProjectModel
{
    public function __construct($id = "")
    {
        $this->emailSettings = new EmailSettings();
        parent::__construct($id);
    }

    /** @var EmailSettings */
    public $emailSettings;
}
