<?php
namespace Api\Model;

class UnreadTextModel extends UserUnreadModel
{
    public function __construct($userId, $projectId)
    {
        parent::__construct('text', $userId, $projectId);
    }
}
