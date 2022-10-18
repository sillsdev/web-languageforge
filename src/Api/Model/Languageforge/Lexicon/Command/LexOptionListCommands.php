<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Languageforge\Lexicon\LexOptionListModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonDecoder;
use Palaso\Utilities\CodeGuard;

class LexOptionListCommands
{
    /**
     * Update the optionlist with params
     * @param $projectId
     * @param array $params (encoded LexOptionListModel)
     * @return string $optionlistId
     */
    public static function updateList($projectId, $params)
    {
        CodeGuard::checkTypeAndThrow($params, "array");
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if (array_key_exists("id", $params) && $params["id"] != "") {
            $optionlist = new LexOptionListModel($project, $params["id"]);
        } else {
            $optionlist = new LexOptionListModel($project);
        }

        JsonDecoder::decode($optionlist, $params);
        return $optionlist->write();
    }
}
