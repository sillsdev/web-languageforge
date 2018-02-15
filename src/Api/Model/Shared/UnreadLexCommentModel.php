<?php

namespace Api\Model\Shared;

class UnreadLexCommentModel extends UserUnreadModel
{
    public function __construct($userId, $projectId, $questionId)
    {
        parent::__construct(ActivityModel::LEX_COMMENT, $userId, $projectId, $questionId);
    }
}
