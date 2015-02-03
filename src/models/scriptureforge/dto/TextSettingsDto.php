<?php

namespace models\scriptureforge\dto;

use models\shared\dto\RightsHelper;
use models\mapper\JsonEncoder;
use models\scriptureforge\SfchecksProjectModel;
use models\QuestionAnswersListModel;
use models\QuestionModel;
use models\TextModel;
use models\UserModel;

class TextSettingsDto
{
    /**
     * @param string $projectId
     * @param string $textId
     * @param string $userId
     * @returns array - the DTO array
     */
    public static function encode($projectId, $textId, $userId)
    {
        $user = new UserModel($userId);
        $project = new SfchecksProjectModel($projectId);
        $text = new TextModel($project, $textId);
        $questionList = new QuestionAnswersListModel($project, $textId);
        $questionList->read();

        $data = array();
        $data['text'] = JsonEncoder::encode($text);
        $data['archivedQuestions'] = array();
        foreach ($questionList->entries as $questionData) {
            $question = new QuestionModel($project, $questionData['id']);
            if ($question->isArchived) {
                // Just want answer count, not whole list
                $questionData['answerCount'] = count($questionData['answers']);
                $responseCount = 0; // "Reponses" = answers + comments
                foreach ($questionData['answers'] as $a) {
                    $commentCount = count($a['comments']);
                    $responseCount += $commentCount+1; // +1 for this answer
                }
                $questionData['responseCount'] = $responseCount;
                unset($questionData['answers']);
                $questionData['dateModified'] = $question->dateModified->format(\DateTime::RFC2822);

                $data['archivedQuestions'][] = $questionData;
            }
        }
        $data['rights'] = RightsHelper::encode($user, $project);
        $data['bcs'] = BreadCrumbHelper::encode('settings', $project, $text, null);

        return $data;
    }
}
