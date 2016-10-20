<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\UserUnreadModel;

class UnreadTextModel extends UserUnreadModel
{
    public function __construct($userId, $projectId)
    {
        parent::__construct('text', $userId, $projectId);
    }
}
