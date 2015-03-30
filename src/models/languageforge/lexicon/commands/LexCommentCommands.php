<?php

namespace models\languageforge\lexicon\commands;

use Palaso\Utilities\CodeGuard;
use models\languageforge\lexicon\LexCommentModel;
use models\languageforge\lexicon\LexCommentReply;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonDecoder;
use models\shared\dto\RightsHelper;
use models\shared\rights\Domain;
use models\shared\rights\Operation;
use models\shared\UserGenericVoteModel;
use models\mapper\Id;

class LexCommentCommands
{
    public static function updateComment($projectId, $userId, $website, $params)
    {
        CodeGuard::checkTypeAndThrow($params, 'array');
        $project = new LexiconProjectModel($projectId);
        $rightsHelper = new RightsHelper($userId, $project, $website);
        $isNew = ($params['id'] == '');
        if ($isNew) {
            $comment = new LexCommentModel($project);
        } else {
            $comment = new LexCommentModel($project, $params['id']);
            if ($comment->authorInfo->createdByUserRef->asString() != $userId && !$rightsHelper->userHasProjectRight(Domain::COMMENTS + Operation::EDIT)) {
                throw new \Exception("No permission to update other people's lex comments!");
            }

            // don't allow setting these on update
            unset($params['regarding']);
            unset($params['entryRef']);
        }

        JsonDecoder::decode($comment, $params);

        if ($isNew) {
            $comment->authorInfo->createdByUserRef->id = $userId;
            $comment->authorInfo->createdDate = new \DateTime();
        }
        $comment->authorInfo->modifiedByUserRef->id = $userId;
        $comment->authorInfo->modifiedDate = new \DateTime();

        return $comment->write();
    }

    public static function updateReply($projectId, $userId, $website, $commentId, $params)
    {
        CodeGuard::checkTypeAndThrow($params, 'array');
        CodeGuard::checkEmptyAndThrow($commentId, 'commentId in updateReply()');
        $project = new LexiconProjectModel($projectId);
        $comment = new LexCommentModel($project, $commentId);
        $rightsHelper = new RightsHelper($userId, $project, $website);
        $replyId = $params['id'];
        if (array_key_exists('id', $params) && $replyId != '') {
            $reply = $comment->getReply($replyId);
            if ($reply->authorInfo->createdByUserRef->asString() != $userId && !$rightsHelper->userHasProjectRight(Domain::COMMENTS + Operation::EDIT)) {
                throw new \Exception("No permission to update other people's lex comment replies!");
            }
            if ($reply->content != $params['content']) {
                $reply->authorInfo->modifiedDate = new \DateTime();
            }
            $reply->content = $params['content'];
            $comment->setReply($replyId, $reply);
        } else {
            $reply = new LexCommentReply();
            $reply->content = $params['content'];
            $reply->authorInfo->createdByUserRef->id = $userId;
            $reply->authorInfo->modifiedByUserRef->id = $userId;
            $reply->authorInfo->createdDate = new \DateTime();
            $comment->replies->append($reply);
            $replyId = $reply->id;
        }
        $comment->write();

        return $replyId;
    }

    public static function plusOneComment($projectId, $userId, $commentId)
    {
        $project = new LexiconProjectModel($projectId);
        $comment = new LexCommentModel($project, $commentId);

        $vote = new UserGenericVoteModel($userId, $projectId, 'lexCommentPlusOne');
        if (!$vote->hasVote($commentId)) {
            $comment->score++;
            $comment->write();
            $vote->addVote($commentId);
            $vote->write();
        }
    }

    public static function updateCommentStatus($projectId, $commentId, $status)
    {
        if (in_array($status, array(LexCommentModel::STATUS_OPEN, LexCommentModel::STATUS_RESOLVED, LexCommentModel::STATUS_TODO))) {
            $project = new LexiconProjectModel($projectId);
            $comment = new LexCommentModel($project, $commentId);

            $comment->status = $status;
            $comment->write();
        } else {
            throw new \Exception("unknown status type: $status");
        }
    }

    /**
     * @param  string                    $projectId
     * @param  string                    $userId
     * @param  \libraries\shared\Website $website
     * @param  string                    $commentId
     * @throws \Exception
     */
    public static function deleteComment($projectId, $userId, $website, $commentId)
    {
        // user must have DELETE_OWN privilege just to access this method

        $project = new LexiconProjectModel($projectId);
        $comment = new LexCommentModel($project, $commentId);
        if ($comment->authorInfo->createdByUserRef->asString() != $userId) {

            // if the userId is different from the author, throw if user does not have DELETE privilege
            $rh = new RightsHelper($userId, $project, $website);
            if (!$rh->userHasProjectRight(Domain::COMMENTS + Operation::DELETE)) {
                throw new \Exception("No permission to delete other people's comments!");
            }
        }
        LexCommentModel::remove($project, $commentId);
    }

    /**
     * @param  string                    $projectId
     * @param  string                    $userId
     * @param  \libraries\shared\Website $website
     * @param  string                    $commentId
     * @param  string                    $replyId
     * @throws \Exception
     */
    public static function deleteReply($projectId, $userId, $website, $commentId, $replyId)
    {
        // if the userId is different from the author, throw if user does not have DELETE privilege
        $project = new LexiconProjectModel($projectId);
        $comment = new LexCommentModel($project, $commentId);
        $reply = $comment->getReply($replyId);
        if ($reply->authorInfo->createdByUserRef->asString() != $userId) {

            // if the userId is different from the author, throw if user does not have DELETE privilege
            $rh = new RightsHelper($userId, $project, $website);
            if (!$rh->userHasProjectRight(Domain::COMMENTS + Operation::DELETE)) {
                throw new \Exception("No permission to delete other people's comment replies!");
            }
        }
        $comment->deleteReply($replyId);
        $comment->write();
    }

}
