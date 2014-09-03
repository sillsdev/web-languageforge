<?php

namespace models\scriptureforge\dto;

class BreadCrumbHelper
{
    /**
     *
     * @param string $operation
     * @param ProjectModel $project
     * @param TextModel $text
     * @param QuestionModel $question
     * @return array
     */
    public static function encode($operation, $project, $text, $question)
    {
        $result = array();
        $result['op'] = $operation;
        $result['project'] = array('id' => $project->id->asString(), 'crumb' => $project->projectName);
        if ($text) {
            $result['text'] = array('id' => $text->id->asString(), 'crumb' => $text->title);
        }
        if ($question) {
            $result['text'] = array('id' => $question->id->asString(), 'crumb' => $question->title);
        }

        return $result;
    }
}
