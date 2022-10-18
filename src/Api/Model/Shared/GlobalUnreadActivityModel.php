<?php

namespace Api\Model\Shared;

class GlobalUnreadActivityModel extends UserUnreadModel
{
    public function __construct($userId)
    {
        // Note: this is primarily a migration class to support reading of old activity not associated with a project - cjh 2014-07
        parent::__construct("activity", $userId, "");
    }
}
