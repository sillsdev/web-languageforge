<?php
namespace models;

class UnreadActivityModel extends UserUnreadModel
{
    public function __construct($userId, $projectId)
    {
        parent::__construct('activity', $userId, $projectId);
    }

}
