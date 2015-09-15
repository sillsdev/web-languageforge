<?php

namespace Api\Model\Command;

use Palaso\Utilities\CodeGuard;
use Api\Model\Scriptureforge\Dto\QuestionCommentDto;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\JsonDecoder;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\AnswerModel;
use Api\Model\CommentModel;
use Api\Model\ProjectModel;
use Api\Model\QuestionModel;
use Api\Model\UserVoteModel;

class QuestionCommands
{

    public static function updateQuestion($projectId, $object)
    {
        $projectModel = new \Api\Model\ProjectModel($projectId);
        $questionModel = new \Api\Model\QuestionModel($projectModel);
        $isNewQuestion = ($object['id'] == '');
        if (!$isNewQuestion) {
            $questionModel->read($object['id']);
        }
        JsonDecoder::decode($questionModel, $object);
        $questionId = $questionModel->write();
        if ($isNewQuestion) {
            ActivityCommands::addQuestion($projectModel, $questionId, $questionModel);
        }

        return $questionId;
    }

    public static function readQuestion($projectId, $questionId)
    {
        $projectModel = new \Api\Model\ProjectModel($projectId);
        $questionModel = new \Api\Model\QuestionModel($projectModel, $questionId);

        return JsonEncoder::encode($questionModel);
    }

    /**
     * @param string $projectId
     * @param array $questionIds
     * @return int Total number of questions archived.
     */
    public static function archiveQuestions($projectId, $questionIds)
    {
        $project = new ProjectModel($projectId);
        $count = 0;
        foreach ($questionIds as $questionId) {
            $question = new QuestionModel($project, $questionId);
            $question->isArchived = true;
            $question->write();
            $count++;
        }

        return $count;
    }

    /**
     * @param string $projectId
     * @param array $questionIds
     * @return int Total number of questions published.
     */
    public static function publishQuestions($projectId, $questionIds)
    {
        $project = new ProjectModel($projectId);
        $count = 0;
        foreach ($questionIds as $questionId) {
            $question = new QuestionModel($project, $questionId);
            $question->isArchived = false;
            $question->write();
            $count++;
        }

        return $count;
    }

    /**
     * @param string $projectId
     * @param array $questionIds
     * @return int Total number of questions removed.
     */
    public static function deleteQuestions($projectId, $questionIds)
    {
        $projectModel = new ProjectModel($projectId);
        $count = 0;
        foreach ($questionIds as $questionId) {
            QuestionModel::remove($projectModel->databaseName(), $questionId);
            $count++;
        }

        return $count;
    }

    /* deprecated - cjh - use dto instead
    public static function listQuestions($projectId, $textId, $authUserId)
    {
        // TODO: validate $authUserId as authorized to perform this action
        $projectModel = new \Api\Model\ProjectModel($projectId);
        $questionListModel = new \Api\Model\QuestionListModel($projectModel, $textId);
        $questionListModel->read();
        return $questionListModel;
    }
    */

    /**
     * Creates or updates an answer for the given $questionId.
     * @param string $projectId
     * @param string $questionId
     * @param array $answerJson    is decoded into an AnswerModel
     * @param string $userId
     * @return array Returns an encoded QuestionDTO fragment for the Answer
     * @see AnswerModel
     */
    public static function updateAnswer($projectId, $questionId, $answerJson, $userId)
    {
        CodeGuard::assertKeyExistsOrThrow('id', $answerJson, "answerJson");
        CodeGuard::checkNotFalseAndThrow($answerJson['content'], "answerJson['content']");
        $project = new ProjectModel($projectId);
        $question = new QuestionModel($project, $questionId);

        // whitelist updatable items
        if ($answerJson['id'] != '') {
            // update existing answer
            $answer = $question->readAnswer($answerJson['id']);
            $answer->content = $answerJson['content'];
        } else {
            // create new answer
            $answer = new AnswerModel();
            JsonDecoder::decode($answer, array('id' => '', 'content' => $answerJson['content']));
            $answer->userRef->id = $userId;
        }
        if (array_key_exists('textHighlight', $answerJson)) {
            $answer->textHighlight = $answerJson['textHighlight'];
        }
        $answerId = $question->writeAnswer($answer);

        // Re-read question model to pick up new answer
        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        if ($answerJson['id'] != '') {
            // TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
            ActivityCommands::updateAnswer($project, $questionId, $newAnswer);
        } else {
            ActivityCommands::addAnswer($project, $questionId, $newAnswer);
        }

        return self::encodeAnswer($newAnswer);
    }

    /**
     *
     * @param string $projectId
     * @param string $questionId
     * @param string $answerId
     * @return object $result
     */
    public static function removeAnswer($projectId, $questionId, $answerId)
    {
        $projectModel = new \Api\Model\ProjectModel($projectId);

        return QuestionModel::removeAnswer($projectModel->databaseName(), $questionId, $answerId);
    }

    /**
     * Updates an answer's isToBeExported flag.
     * @param string $projectId
     * @param string $questionId
     * @param string $answerId
     * @param Boolean $isToBeExported
     * @return array Returns an encoded QuestionDTO fragment for the Answer
     */
    public static function updateAnswerExportFlag($projectId, $questionId, $answerId, $isToBeExported)
    {
        CodeGuard::checkNotFalseAndThrow($answerId, 'answerId');
        $project = new ProjectModel($projectId);
        $question = new QuestionModel($project, $questionId);
        $answer = $question->readAnswer($answerId);
        $answer->isToBeExported = $isToBeExported;
        $answerId = $question->writeAnswer($answer);

        return self::encodeAnswer($answer);
    }

    /**
     * Updates an answer's tags.
     * @param string $projectId
     * @param string $questionId
     * @param string $answerId
     * @param array $tagsArray
     * @return array Returns an encoded QuestionDTO fragment for the Answer
     */
    public static function updateAnswerTags($projectId, $questionId, $answerId, $tagsArray)
    {
        CodeGuard::checkNotFalseAndThrow($answerId, 'answerId');
        $project = new ProjectModel($projectId);
        $question = new QuestionModel($project, $questionId);
        $answer = $question->readAnswer($answerId);
        $answer->tags = new ArrayOf();
        foreach ($tagsArray as $tag) {
            $answer->tags[] = $tag;
        }
        $answerId = $question->writeAnswer($answer);

        return self::encodeAnswer($answer);
    }

    /**
     * Creates / Updates a comment on the given answer.
     * @param string $projectId
     * @param string $questionId
     * @param string $answerId
     * @param array $comment
     * @param string $userId
     * @return array Dto
     */
    public static function updateComment($projectId, $questionId, $answerId, $comment, $userId)
    {
        $projectModel = new ProjectModel($projectId);
        $questionModel = new QuestionModel($projectModel, $questionId);
        $authorId = $userId;
        if ($comment['id'] != '') {
            // update existing comment
            $oldComment = $questionModel->readComment($answerId, $comment['id']);
            $authorId = $oldComment->userRef->asString();
        }
        $commentModel = new CommentModel();
        JsonDecoder::decode($commentModel, $comment);
        $commentModel->userRef->id = $authorId;
        $commentId = QuestionModel::writeComment($projectModel->databaseName(), $questionId, $answerId, $commentModel);
        $questionModel->read($questionId);
        $newComment = $questionModel->readComment($answerId, $commentId);
        $commentDTO = QuestionCommentDto::encodeComment($newComment);

        if ($comment['id'] != '') {
            // TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
            ActivityCommands::updateComment($projectModel, $questionId, $answerId, $newComment);
        } else {
            ActivityCommands::addComment($projectModel, $questionId, $answerId, $newComment);
        }

        $dto = array();
        $dto[$commentId] = $commentDTO;

        return $dto;
    }

    public static function removeComment($projectId, $questionId, $answerId, $commentId)
    {
        $projectModel = new \Api\Model\ProjectModel($projectId);

        return QuestionModel::removeComment($projectModel->databaseName(), $questionId, $answerId, $commentId);
    }

    /**
     * Returns the AnswerModel as an AnswerDTO, a part of the QuestionDTO.
     * @param AnswerModel $answerModel
     * @return array
     */
    private static function encodeAnswer($answerModel)
    {
        $answerDTO = QuestionCommentDto::encodeAnswer($answerModel);
        $answerId = $answerModel->id->asString();
        $dto = array();
        $dto[$answerId] = $answerDTO;
        return $dto;
    }

    /**
     * Up votes the given answer, if permitted for the given $userId
     * @param string $userId
     * @param string $projectId
     * @param string $questionId
     * @param string $answerId
     */
    public static function voteUp($userId, $projectId, $questionId, $answerId)
    {
        $projectModel = new ProjectModel($projectId);
        $questionModel = new QuestionModel($projectModel, $questionId);
        // Check the vote lock.
        $vote = new UserVoteModel($userId, $projectId, $questionId);
        if ($vote->hasVote($answerId)) {
            // Don't throw.  There's no harm in this, just don't increment the vote.
            return self::encodeAnswer($questionModel->readAnswer($answerId));
        }
        // If ok up vote the question and add the lock.
        $answerModel = $questionModel->readAnswer($answerId);
        $answerModel->score++;
        $questionModel->writeAnswer($answerModel);
        $vote->addVote($answerId);
        $vote->write();
        ActivityCommands::updateScore($projectModel, $questionId, $answerId, $userId);
        // Return the answer dto.
        return self::encodeAnswer($answerModel);
    }

    public static function voteDown($userId, $projectId, $questionId, $answerId)
    {
        $projectModel = new ProjectModel($projectId);
        $questionModel = new QuestionModel($projectModel, $questionId);
        // Check the vote lock.
        $vote = new UserVoteModel($userId, $projectId, $questionId);
        if (!$vote->hasVote($answerId)) {
            // Don't throw.  There's no harm in this, just don't decrement the vote.
            return self::encodeAnswer($questionModel->readAnswer($answerId));
        }
        // If ok down vote the question and remove the lock.
        $answerModel = $questionModel->readAnswer($answerId);
        $answerModel->score--;
        $questionModel->writeAnswer($answerModel);
        $vote->removeVote($answerId);
        $vote->write();
        // Return the answer dto.
        return self::encodeAnswer($answerModel);
    }

}
