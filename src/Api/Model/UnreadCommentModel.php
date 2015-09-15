<?php
namespace Api\Model;

class UnreadCommentModel extends UserUnreadModel
{
    public function __construct($userId, $projectId, $questionId)
    {
        parent::__construct('comment', $userId, $projectId, $questionId);
    }
}
