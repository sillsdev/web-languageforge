<?php
namespace Api\Library\Shared\Script\Migration;

require_once APPPATH . 'Api/Model/TextModel.php';
require_once APPPATH . 'Api/Model/QuestionModel.php';

use Api\Model\QuestionListModel;
use Api\Model\QuestionModel;
use Api\Model\TextModel;
use Api\Model\TextListModel;
use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;
use Api\Model\UserListModel;

class FixAnswerCommentUserRefs
{
    public function run($mode = 'test')
    {
        $testMode = ($mode == 'test');
        $message = "";
        $userlist = new UserListModel();
        $userlist->read();
        $userIds = array_map(function ($e) { return $e['id'];}, $userlist->entries);

        $projectlist = new ProjectListModel();
        $projectlist->read();
        $projectIds = array_map(function ($e) { return $e['id'];}, $projectlist->entries);

        $deadCommentUserRefs = 0;
        $deadAnswerUserRefs = 0;

        foreach ($projectIds as $projectId) {
            $project = new ProjectModel($projectId);
            $textlist = new TextListModel($project);
            $textlist->read();
            $textIds = array_map(function ($e) { return $e['id'];}, $textlist->entries);

            foreach ($textIds as $textId) {

                $questionlist = new QuestionListModel($project, $textId);
                $questionlist->read();
                $questionIds = array_map(function ($e) { return $e['id'];}, $questionlist->entries);

                foreach ($questionIds as $questionId) {
                    $question = new QuestionModel($project, $questionId);

                    foreach ($question->answers as $answerId => $answer) {

                        foreach ($answer->comments as $commentId => $comment) {
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
