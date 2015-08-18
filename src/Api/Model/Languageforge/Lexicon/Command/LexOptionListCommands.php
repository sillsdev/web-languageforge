<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Palaso\Utilities\CodeGuard;
use Api\Model\Languageforge\Lexicon\LexOptionListModel;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Mapper\JsonDecoder;

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
