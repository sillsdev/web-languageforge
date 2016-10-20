<?php

namespace Api\Model\Scriptureforge\Dto;

use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Scriptureforge\SfchecksProjectModel;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Dto\RightsHelper;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UnreadActivityModel;
use Api\Model\Shared\UnreadAnswerModel;
use Api\Model\Shared\UnreadCommentModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserVoteModel;

class QuestionCommentDto
{
    /**
     * Encodes a QuestionModel and related data for $questionId
     * @param string $projectId
     * @param string $questionId
     * @param string $userId
     * @return array - The DTO.
     * @throws ResourceNotAvailableException
     */
    public static function encode($projectId, $questionId, $userId)
    {
        $user = new UserModel($userId);
        $project = new SfchecksProjectModel($projectId);
        $question = new QuestionModel($project, $questionId);
        $textId = $question->textRef->asString();
        $text = new TextModel($project, $textId);
        if (($text->isArchived || $question->isArchived) && $project->users[$userId]->role != ProjectRoles::MANAGER) {
            throw new ResourceNotAvailableException("This Question is no longer available. If this is incorrect contact your project manager.");
        }
        $usxHelper = new UsxHelper($text->content);
        //echo $usxHelper->toHtml();
        //echo $text->content;

        $votes = new UserVoteModel($userId, $projectId, $questionId);
        $votesDto = array();
        foreach ($votes->votes as $vote) {
            $votesDto[$vote->answerRef->id] = true;
        }

        $unreadAnswerModel = new UnreadAnswerModel($userId, $project->id->asString(), $questionId);
        $unreadAnswers = $unreadAnswerModel->unreadItems();
        $unreadAnswerModel->markAllRead();
        $unreadAnswerModel->write();

        $unreadCommentModel = new UnreadCommentModel($userId, $project->id->asString(), $questionId);
        $unreadComments = $unreadCommentModel->unreadItems();
        $unreadCommentModel->markAllRead();
        $unreadCommentModel->write();

        $unreadActivityModel = new UnreadActivityModel($userId, $projectId);
        $unreadActivity = $unreadActivityModel->unreadItems();

        $dto = array();
        $dto['question'] = QuestionCommentDtoEncoder::encode($question);
        $dto['votes'] = $votesDto;
        $dto['text'] = JsonEncoder::encode($text);
        $dto['text']['content'] = $usxHelper->toHtml();
        $dto['project'] = JsonEncoder::encode($project);
        $dto['project']['slug'] = $project->databaseName();
        $dto['rights'] = RightsHelper::encode($user, $project);
        $dto['unreadAnswers'] = $unreadAnswers;
        $dto['unreadComments'] = $unreadComments;
        $dto['unreadActivityCount'] = count($unreadActivity);

        return $dto;
    }

    /**
     * Encodes a $answerModel in the same method as returned by the
     * @param AnswerModel $answerModel
     * @return array - The DTO.
     */
    public static function encodeAnswer($answerModel)
    {
        $dto = QuestionCommentDtoEncoder::encode($answerModel);

        return $dto;
    }

    /**
     * Encodes a $commentModel in the same method as returned by the
     * @param CommentModel $commentModel
     * @return array - The DTO.
     */
    public static function encodeComment($commentModel)
    {
        $dto = QuestionCommentDtoEncoder::encode($commentModel);

        return $dto;
    }

}
