<?php

namespace Api\Model\Shared;

class UnreadCommentModel extends UserUnreadModel
{
    public function __construct($userId, $projectId, $questionId)
    {
        parent::__construct("comment", $userId, $projectId, $questionId);
    }
}
