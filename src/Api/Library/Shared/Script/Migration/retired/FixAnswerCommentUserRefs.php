<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Scriptureforge\Sfchecks\QuestionListModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextListModel;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserListModel;

class FixAnswerCommentUserRefs
{
    public function run($mode = 'test')
    {
        $testMode = ($mode == 'test');
        $message = "";
        $userList = new UserListModel();
        $userList->read();
        $userIds = array_map(function ($e) { return $e['id'];}, $userList->entries);

        $projectList = new ProjectListModel();
        $projectList->read();
        $projectIds = array_map(function ($e) { return $e['id'];}, $projectList->entries);

        $deadCommentUserRefs = 0;
        $deadAnswerUserRefs = 0;

        foreach ($projectIds as $projectId) {
            $project = new ProjectModel($projectId);
            $textList = new TextListModel($project);
            $textList->read();
            $textIds = array_map(function ($e) { return $e['id'];}, $textList->entries);

            foreach ($textIds as $textId) {
                $questionList = new QuestionListModel($project, $textId);
                $questionList->read();
                $questionIds = array_map(function ($e) { return $e['id'];}, $questionList->entries);

                foreach ($questionIds as $questionId) {
                    $question = new QuestionModel($project, $questionId);

                    foreach ($question->answers as $answerId => $answer) {

                        foreach ($answer->comments as $commentId => $comment) {
                            /** @var IdReference $ref */
                            $ref = $comment->userRef;
                            if (!empty($ref->id) && !in_array($ref->asString(), $userIds)) {
                                $comment->userRef->id = '';
                                if (!$testMode) {
                                    $question->writeComment($project->databaseName(), $questionId, $answerId, $comment);
                                }
                                $deadCommentUserRefs++;
                                $message .= "Removed dead user-comment ref $ref from question $questionId, answer $answerId, comment $commentId\n";
                            }
                        }

                        $ref = $answer->userRef;
                        if (!empty($ref->id) && !in_array($ref->asString(), $userIds)) {
                            $answer->userRef->id = '';
                            if (!$testMode) {
                                $question->writeAnswer($answer);
                            }
                            $deadAnswerUserRefs++;
                            $message .= "Removed dead user-answer ref $ref from question $questionId, answer $answerId\n";
                        }

                    }
                }

            }
        }

        if ($deadAnswerUserRefs > 0) {
            $message .= "\n\nRemoved dead user references from $deadAnswerUserRefs answers\n\n";
        } else {
            $message .= "\n\nNo dead user references were found in answers\n\n";
        }

        if ($deadCommentUserRefs > 0) {
            $message .= "\n\nRemoved dead user references from $deadCommentUserRefs comments\n\n";
        } else {
            $message .= "\n\nNo dead user references were found in comments\n\n";
        }

        return $message;
    }
}
