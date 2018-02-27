<?php

namespace Api\Model\Shared;

class UnreadLexReplyModel extends UserUnreadModel
{
    public function __construct($userId, $projectId, $questionId)
    {
        parent::__construct(ActivityModel::LEX_REPLY, $userId, $projectId, $questionId);
    }
}
