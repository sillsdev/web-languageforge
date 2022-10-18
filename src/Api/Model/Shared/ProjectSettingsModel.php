<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Communicate\EmailSettings;
use Api\Model\Shared\Communicate\SmsSettings;

/**
 * This class is separate from the ProjectModel to protect the smsSettings and emailSettings which are managed
 * by the site administrator only.
 */
class ProjectSettingsModel extends ProjectModel
{
    public function __construct($id = "")
    {
        $this->smsSettings = new SmsSettings();
        $this->emailSettings = new EmailSettings();
        parent::__construct($id);
    }

    /** @var SmsSettings */
    public $smsSettings;

    /** @var EmailSettings */
    public $emailSettings;
}
