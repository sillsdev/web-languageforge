<?php
namespace models\scriptureforge\dto;

use libraries\shared\palaso\exceptions\ResourceNotAvailableException;
use models\shared\dto\RightsHelper;
use models\shared\rights\ProjectRoles;
use models\scriptureforge\SfchecksProjectModel;
use models\mapper\JsonEncoder;
use models\QuestionAnswersListModel;
use models\QuestionModel;
use models\TextModel;
use models\UserModel;

class QuestionListDto
{

    /**
     *
     * @param string $projectId
     * @param string $textId
     * @param string $userId
     * @return array - the DTO array
     */
    public static function encode($projectId, $textId, $userId)
    {
        $project = new SfchecksProjectModel($projectId);
        $text = new TextModel($project, $textId);
        $user = new UserModel($userId);
        if (($project->isArchived || $text->isArchived) && $project->users[$userId]->role != ProjectRoles::MANAGER) {
            throw new ResourceNotAvailableException("This Text is no longer available. If this is incorrect contact your project manager.");
        }
        $questionList = new QuestionAnswersListModel($project, $textId);
        $questionList->read();

        $data = array();
        $data['rights'] = RightsHelper::encode($user, $project);
        $data['entries'] = array();
        $data['project'] = array(
            'id' => $projectId,
            'name' => $project->projectName,
            'slug' => $project->databaseName(),
            'allowAudioDownload' => $project->allowAudioDownload
        );
        $data['text'] = JsonEncoder::encode($text);
        $usxHelper = new UsxHelper($text->content);
        $data['text']['content'] = $usxHelper->toHtml();
        foreach ($questionList->entries as $questionData) {
            $question = new QuestionModel($project, $questionData['id']);
            if (! $question->isArchived) {
                // Just want answer count, not whole list
                $questionData['answerCount'] = count($questionData['answers']);
                $responseCount = 0; // "Reponses" = answers + comments
                foreach ($questionData['answers'] as $a) {
                    $commentCount = count($a['comments']);
                    $responseCount += $commentCount + 1; // +1 for this answer
                }
                $questionData['responseCount'] = $responseCount;
                unset($questionData['answers']);
                $questionData['dateCreated'] = $question->dateCreated->format(\DateTime::RFC2822);

                $data['entries'][] = $questionData;
            }
        }

        // sort Questions with newest at the top
        usort($data['entries'], function ($a, $b)
        {
            $sortOn = 'dateCreated';
            if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
                return (strtotime($a[$sortOn]) < strtotime($b[$sortOn])) ? 1 : -1;
            } else {
                return 0;
            }
        });

        $data['count'] = count($data['entries']);

        return $data;
    }
}
