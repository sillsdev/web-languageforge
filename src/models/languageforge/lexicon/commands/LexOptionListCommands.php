<?php

namespace models\languageforge\lexicon\commands;


use libraries\shared\palaso\CodeGuard;
use models\languageforge\lexicon\LexOptionListModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonDecoder;


class LexOptionListCommands {

    public static function updateList($projectId, $data) {
        CodeGuard::checkTypeAndThrow($data, 'array');
        $project = new LexiconProjectModel($projectId);
        if (array_key_exists('id', $data) && $data['id'] != '') {
            $optionlist = new LexOptionListModel($project, $data['id']);
        } else {
            $optionlist = new LexOptionListModel($project);
        }

        JsonDecoder::decode($optionlist, $data);
        $optionlist->write();
    }

} 