<?php

namespace models\languageforge\lexicon\commands;

use Palaso\Utilities\CodeGuard;
use models\languageforge\lexicon\LexOptionListModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonDecoder;

class LexOptionListCommands
{
    /**
     * Update the optionlist with params
     * @param $projectId
     * @param LexOptionListModel $params
     */
    public static function updateList($projectId, $params)
    {
        CodeGuard::checkTypeAndThrow($params, 'array');
        $project = new LexiconProjectModel($projectId);
        if (array_key_exists('id', $params) && $params['id'] != '') {
            $optionlist = new LexOptionListModel($project, $params['id']);
        } else {
            $optionlist = new LexOptionListModel($project);
        }

        JsonDecoder::decode($optionlist, $params);
        $optionlist->write();
    }

}
