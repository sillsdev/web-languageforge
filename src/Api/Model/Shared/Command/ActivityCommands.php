<?php

namespace Api\Model\Shared\Command;

use Api\Library\Shared\Palaso\StringUtil;
use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\LexCommentModel;
use Api\Model\Languageforge\Lexicon\LexCommentReply;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UnreadActivityModel;
use Api\Model\Shared\UnreadAnswerModel;
use Api\Model\Shared\UnreadCommentModel;
use Api\Model\Shared\UnreadLexCommentModel;
use Api\Model\Shared\UnreadQuestionModel;

class ActivityCommands
{
    // constants used in updateScore and updateEntryCommentScore
    const INCREASE_SCORE = 'increase';
    const DECREASE_SCORE = 'decrease';

    /**
     * @param ProjectModel $projectModel
     * @param string $userId
     * @return string activity id
     * @throws \Exception
     */
    public static function addUserToProject($projectModel, $userId)
    {
        $activity = new ActivityModel($projectModel);
        $activity->action = ActivityModel::ADD_USER_TO_PROJECT;
        $activity->userRef->id = $userId; // we can use the userRef in this case because we don't keep track of the user that performed this action
        $user = new UserModel($userId);
        $activity->addContent(ActivityModel::USER, $user->username);
        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);

        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $userId
     * @param LexEntryModel $entry
     * @param string $action
     * @param array $actionContent
     * @return string activity id
     */
    public static function writeEntry($projectModel, $userId, $entry, $action, $actionContent = null)
    {
        $activity = new ActivityModel($projectModel);
        $activity->entryRef->id = $entry->id->asString();
        $user = new UserModel($userId);
        $activity->userRef->id = $userId;
        if ($action == 'update') {
            $activity->action = ActivityModel::UPDATE_ENTRY;
            $title = LexEntryCommands::getEntryLexeme($projectModel->id->asString(), $entry->id->asString());
        } else {
            $activity->action = ActivityModel::ADD_ENTRY;
            try {
                $title = LexEntryCommands::getEntryLexeme($projectModel->id->asString(), $entry->id->asString());
            } catch (\Exception $ex) {
                $title = '';
            }
        }

        $activity->addContent(ActivityModel::ENTRY, $title);
        $activity->addContent(ActivityModel::USER, $user->username);

        if (isset($actionContent)) {
            foreach ($actionContent as $type => $content) {
                $activity->addContent($type, $content);
            }
        }

        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);
        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $userId
     * @param string $id entry id
     * @return string activity id
     */
    public static function deleteEntry($projectModel, $userId, $id)
    {
        $activity = new ActivityModel($projectModel);
        $activity->userRef->id = $userId;
        $activity->action = ActivityModel::DELETE_ENTRY;

        $lexeme = LexEntryCommands::getEntryLexeme($projectModel->id->asString(), $id);
        $activity->addContent(ActivityModel::ENTRY, $lexeme);

        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);
        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @param string $mode
     * @return string activity id
     * @throws \Exception
     */
    public static function updateCommentOnEntry($projectModel, $entryId, $commentModel, $mode = "update")
    {
        $activity = new ActivityModel($projectModel);
        $entry = new LexEntryModel($projectModel, $entryId);
        if ($mode === 'update') {
            $userId = $commentModel->authorInfo->modifiedByUserRef->asString();
        } else {
            $userId = $commentModel->authorInfo->createdByUserRef->asString();
        }
        $user = new UserModel($userId);
        $activity->action = ($mode == 'update') ? ActivityModel::UPDATE_LEX_COMMENT : ActivityModel::ADD_LEX_COMMENT;
        $activity->userRef->id = $userId;
        $activity->entryRef->id = $entryId;
        $activity->addContent(ActivityModel::ENTRY, $entry->nameForActivityLog());
        $activity->addContent(ActivityModel::LEX_COMMENT, $commentModel->content);
        $activity->addContent(ActivityModel::LEX_COMMENT_CONTEXT, $commentModel->contextGuid);
        $activity->addContent(ActivityModel::LEX_COMMENT_FIELD_VALUE, $commentModel->regarding->fieldValue);
        $label = self::prepareActivityLabel($commentModel->contextGuid, $commentModel->regarding->fieldNameForDisplay, $entry);
        if (! empty($label)) {
            $activity->addContent(ActivityModel::LEX_COMMENT_LABEL, $label);
        }
        $activity->addContent(ActivityModel::USER, $user->username);
        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);
        UnreadLexCommentModel::markUnreadForProjectMembers($commentModel->id->asString(), $projectModel, $entryId, $userId);

        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @param string $userId The user who deleted the comment (usually the author, but could be project manager)
     * @return string activity id
     * @throws \Exception
     */
    public static function deleteCommentOnEntry($projectModel, $entryId, $commentModel, $userId)
    {
        $activity = new ActivityModel($projectModel);
        $entry = new LexEntryModel($projectModel, $entryId);
        $authorId = $commentModel->authorInfo->createdByUserRef->asString();
        $user = new UserModel($userId);
        $author = new UserModel($authorId);
        $activity->action = ActivityModel::DELETE_LEX_COMMENT;
        $activity->userRef->id = $userId;
        $activity->entryRef->id = $entryId;
        $activity->addContent(ActivityModel::ENTRY, $entry->nameForActivityLog());
        $activity->addContent(ActivityModel::LEX_COMMENT, $commentModel->content);
        $activity->addContent(ActivityModel::LEX_COMMENT_CONTEXT, $commentModel->contextGuid);
        $activity->addContent(ActivityModel::LEX_COMMENT_FIELD_VALUE, $commentModel->regarding->fieldValue);
        $label = self::prepareActivityLabel($commentModel->contextGuid, $commentModel->regarding->fieldNameForDisplay, $entry);
        if (! empty($label)) {
            $activity->addContent(ActivityModel::LEX_COMMENT_LABEL, $label);
        }
        $activity->addContent(ActivityModel::USER, $user->username);
        $activity->addContent(ActivityModel::USER_RELATED, $author->username);
        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);
        UnreadLexCommentModel::markUnreadForProjectMembers($commentModel->id->asString(), $projectModel, $entryId, $userId);

        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @return string activity id
     * @throws \Exception
     */
    public static function addCommentOnEntry($projectModel, $entryId, $commentModel)
    {
        return ActivityCommands::updateCommentOnEntry($projectModel, $entryId, $commentModel, "add");
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @return string activity id
     * @throws \Exception
     */
    public static function updateEntryCommentStatus($projectModel, $entryId, $commentModel)
    {
        $activity = new ActivityModel($projectModel);
        $entry = new LexEntryModel($projectModel, $entryId);
        $userId = $commentModel->authorInfo->modifiedByUserRef->asString();
        $user = new UserModel($userId);
        $activity->action = ActivityModel::UPDATE_LEX_COMMENT_STATUS;
        $activity->userRef->id = $userId;
        $activity->entryRef->id = $entryId;
        $activity->addContent(ActivityModel::ENTRY, $entry->nameForActivityLog());
        $activity->addContent(ActivityModel::LEX_COMMENT, $commentModel->content);
        $activity->addContent(ActivityModel::LEX_COMMENT_CONTEXT, $commentModel->contextGuid);
        $activity->addContent(ActivityModel::LEX_COMMENT_FIELD_VALUE, $commentModel->regarding->fieldValue);
        $activity->addContent(ActivityModel::LEX_COMMENT_STATUS, $commentModel->status);
        $label = self::prepareActivityLabel($commentModel->contextGuid, $commentModel->regarding->fieldNameForDisplay, $entry);
        if (! empty($label)) {
            $activity->addContent(ActivityModel::LEX_COMMENT_LABEL, $label);
        }
        $activity->addContent(ActivityModel::USER, $user->username);
        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);
        UnreadLexCommentModel::markUnreadForProjectMembers($commentModel->id->asString(), $projectModel, $entryId, $userId);

        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @param string $mode either ActivityCommands::INCREASE_SCORE or ActivityCommands::DECREASE_SCORE
     * @return string activity id
     * @throws \Exception
     */
    public static function updateEntryCommentScore($projectModel, $entryId, $commentModel, $mode = ActivityCommands::INCREASE_SCORE)
    {
        $activity = new ActivityModel($projectModel);
        $entry = new LexEntryModel($projectModel, $entryId);
        $userId = $commentModel->authorInfo->createdByUserRef->asString();
        // We do NOT record who clicked the "Like" button in the activity log, so the only user ID here is the author of the comment.
        $user = new UserModel($userId);
        $activity->action = ($mode == ActivityCommands::INCREASE_SCORE) ? ActivityModel::LEX_COMMENT_INCREASE_SCORE : ActivityModel::LEX_COMMENT_DECREASE_SCORE;
        $activity->userRef->id = $userId;
        $activity->entryRef->id = $entryId;
        $activity->addContent(ActivityModel::ENTRY, $entry->nameForActivityLog());
        $activity->addContent(ActivityModel::LEX_COMMENT, $commentModel->content);
        $activity->addContent(ActivityModel::LEX_COMMENT_CONTEXT, $commentModel->contextGuid);
        $activity->addContent(ActivityModel::LEX_COMMENT_FIELD_VALUE, $commentModel->regarding->fieldValue);
        $label = self::prepareActivityLabel($commentModel->contextGuid, $commentModel->regarding->fieldNameForDisplay, $entry);
        if (! empty($label)) {
            $activity->addContent(ActivityModel::LEX_COMMENT_LABEL, $label);
        }
        $activity->addContent(ActivityModel::USER, $user->username);
        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);

        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @param LexCommentReply $replyModel
     * @param string $mode
     * @return string activity id
     * @throws \Exception
     */
    public static function updateReplyToEntryComment($projectModel, $entryId, $commentModel, $replyModel, $mode = "update")
    {
        // "user" is the one doing the current activity, and "userRelated" the one whose previous activity is being responded to.
        if ($mode === 'update') {
            $userId = $replyModel->authorInfo->modifiedByUserRef->asString();
            $userRelatedId = $commentModel->authorInfo->modifiedByUserRef->asString();
        } else {
            $userId = $replyModel->authorInfo->createdByUserRef->asString();
            $userRelatedId = $commentModel->authorInfo->createdByUserRef->asString();
        }

        $user = new UserModel($userId);
        $userRelated = new UserModel($userRelatedId);
        $activity = new ActivityModel($projectModel);
        $activity->action = ($mode == 'update') ? ActivityModel::UPDATE_LEX_REPLY : ActivityModel::ADD_LEX_REPLY;
        $activity->userRef->id = $userId;
        $activity->userRefRelated->id = $userRelatedId;
        $activity->entryRef->id = $entryId;
        $entry = new LexEntryModel($projectModel, $entryId);
        $activity->addContent(ActivityModel::ENTRY, $entry->nameForActivityLog());
        $activity->addContent(ActivityModel::LEX_COMMENT, $commentModel->content);
        $activity->addContent(ActivityModel::LEX_COMMENT_CONTEXT, $commentModel->contextGuid);
        $activity->addContent(ActivityModel::LEX_COMMENT_FIELD_VALUE, $commentModel->regarding->fieldValue);
        $activity->addContent(ActivityModel::LEX_REPLY, $replyModel->content);
        $label = self::prepareActivityLabel($commentModel->contextGuid, $commentModel->regarding->fieldNameForDisplay, $entry);
        if (! empty($label)) {
            $activity->addContent(ActivityModel::LEX_COMMENT_LABEL, $label);
        }
        $activity->addContent(ActivityModel::USER, $user->username);
        $activity->addContent(ActivityModel::USER_RELATED, $userRelated->username);
        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);
        // Disabling the "mark replies as unread" feature until "unread items" system is revamped. - RM 2018-03
        // (Can't mark things unread unless they have a MongoID, and LexCommentReplies just have a PHP "uniqid". But changing that would have knock-on effects in LfMerge.)
        // UnreadLexReplyModel::markUnreadForProjectMembers($replyModel->id, $projectModel, $entryId, $userId);

        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @param LexCommentReply $replyModel
     * @param string $userId The user who deleted the reply (usually the author, but could be project manager)
     * @return string activity id
     * @throws \Exception
     */
    public static function deleteReplyToEntryComment($projectModel, $entryId, $commentModel, $replyModel, $userId)
    {
        $authorId = $commentModel->authorInfo->createdByUserRef->asString();
        $user = new UserModel($userId);
        $author = new UserModel($authorId);
        $activity = new ActivityModel($projectModel);
        $activity->action = ActivityModel::DELETE_LEX_REPLY;
        $activity->userRef->id = $userId;
        $activity->userRefRelated->id = $authorId;
        $activity->entryRef->id = $entryId;
        $entry = new LexEntryModel($projectModel, $entryId);
        $activity->addContent(ActivityModel::ENTRY, $entry->nameForActivityLog());
        $activity->addContent(ActivityModel::LEX_COMMENT, $commentModel->content);
        $activity->addContent(ActivityModel::LEX_COMMENT_CONTEXT, $commentModel->contextGuid);
        $activity->addContent(ActivityModel::LEX_COMMENT_FIELD_VALUE, $commentModel->regarding->fieldValue);
        $activity->addContent(ActivityModel::LEX_REPLY, $replyModel->content);
        $label = self::prepareActivityLabel($commentModel->contextGuid, $commentModel->regarding->fieldNameForDisplay, $entry);
        if (! empty($label)) {
            $activity->addContent(ActivityModel::LEX_COMMENT_LABEL, $label);
        }
        $activity->addContent(ActivityModel::USER, $user->username);
        $activity->addContent(ActivityModel::USER_RELATED, $author->username);
        $activityId = $activity->write();
        UnreadActivityModel::markUnreadForProjectMembers($activityId, $projectModel);
        // Disabling the "mark replies as unread" feature until "unread items" system is revamped. - RM 2018-03
        // (Can't mark things unread unless they have a MongoID, and LexCommentReplies just have a PHP "uniqid". But changing that would have knock-on effects in LfMerge.)
        // UnreadLexReplyModel::markUnreadForProjectMembers($replyModel->id, $projectModel, $entryId, $userId);

        return $activityId;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param LexCommentModel $commentModel
     * @param LexCommentReply $replyModel
     * @return string activity id
     * @throws \Exception
     */
    public static function addReplyToEntryComment($projectModel, $entryId, $commentModel, $replyModel)
    {
        return ActivityCommands::updateReplyToEntryComment($projectModel, $entryId, $commentModel, $replyModel, "add");
    }

    /**
     * @param string $contextGuid The "context GUID" as recorded by the frontend comment code
     * @param string $fieldLabel The human-readable label of the field commented on
     * @param LexEntryModel $entry
     * @return string
     *
     * Return a string like "sense@1|example@2|Translation" for putting into the activity log as a field label
     * Indexes in this one will be 1-based since there's no need for them to be 0-based: we're only ever using this for human display
     */
    private static function prepareActivityLabel($contextGuid, $fieldLabel, LexEntryModel $entry)
    {
        if (empty($contextGuid) || empty($fieldLabel)) {
            return $fieldLabel ?? '';
        }
        $senseGuid = '';
        $exampleGuid = '';
        $parts = explode(' ', trim($contextGuid));
        $resultParts = [];
        foreach ($parts as $part) {
            if (StringUtil::startsWith($part, 'sense#')) {
                $senseGuid = substr($part, strlen('sense#'));
            } else if (StringUtil::startsWith($part, 'example#')) {
                $exampleGuid = substr($part, strlen('example#'));
            }
        }
        // Find 1-based position of sense and example, if needed for this field
        if (! empty($senseGuid)) {
            $sensePosition = 0;
            foreach ($entry->senses as $sense) {
                /** @var LexSense $sense */
                $sensePosition++;
                if ($sense->guid === $senseGuid) {
                    $resultParts[] = "sense@$sensePosition";
                    $examplePosition = 0;
                    foreach ($sense->examples as $example) {
                        /** @var LexExample $example */
                        $examplePosition++;
                        if ($example->guid === $exampleGuid) {
                            $resultParts[] = "example@$examplePosition";
                        }
                    }
                }
            }
        }
        $resultParts[] = $fieldLabel;
        return implode('|', $resultParts);
    }

}
