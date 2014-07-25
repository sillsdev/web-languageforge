<?php

namespace models\languageforge\lexicon\commands;

use libraries\shared\palaso\CodeGuard;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexEntryWithCommentsEncoder;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexCommentModel;
use models\languageforge\lexicon\LexCommentReply;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;

class LexCommentCommands {
    public static function updateComment($projectId, $userId, $params) {
        CodeGuard::checkTypeAndThrow($params, 'array');
        $project = new LexiconProjectModel($projectId);
        $isNew = ($params['id'] == '');
        if (isNew) {
            $comment = new LexCommentModel($project);
        } else {
            $comment = new LexCommentModel($project, $params['id']);
            if ($comment->authorInfo->createdByUserRef->asString() != $userId) {
                throw new \Exception("You cannot update other people's lex comments!");
            }
        }

        JsonDecoder::decode($comment, $params);

        if ($isNew) {
            $comment->authorInfo->createdByUserRef->id = $userId;
            $comment->authorInfo->createdDate = new \DateTime();
            $comment->authorInfo->modifiedByUserRef->id = $userId;
        } else {
            $comment->authorInfo->modifiedDate = new \DateTime();
        }



        return $comment->write();
    }

    public static function updateReply($projectId, $userId, $commentId, $params) {
        CodeGuard::checkTypeAndThrow($params, 'array');
        CodeGuard::checkEmptyAndThrow($commentId, 'commentId in updateReply()');
        $project = new LexiconProjectModel($projectId);
        $comment = new LexCommentModel($project, $commentId);
        $replyId = $params['id'];
        if (array_key_exists('id', $params) && $replyId != '') {
            $reply = $comment->getReply($replyId);
            if ($reply->authorInfo->createdByUserRef->asString() != $userId) {
                throw new \Exception("You cannot update other people's lex comment replies!");
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
        }
        return $comment->write();
    }

    public static function plusOneComment($projectId, $userId, $commentId) {
        // need to implement user relation role, similar to the score in SF
    }

    public static function updateCommentStatus($projectId, $commentId, $status) {
    }

    public static function deleteComment($projectId, $userId, $commentId) {
        // if the userId is different from the author, throw if user does not have DELETE privilege
        // we really can delete comments

    }

    public static function deleteReply($projectId, $userId, $commentId, $replyId) {
        // if the userId is different from the author, throw if user does not have DELETE privilege

    }






}

?>
