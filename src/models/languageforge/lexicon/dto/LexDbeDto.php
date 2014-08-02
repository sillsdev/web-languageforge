<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\LexCommentListModel;
use models\languageforge\lexicon\LexDeletedEntryListModel;
use models\languageforge\lexicon\LexDeletedCommentListModel;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexEntryWithCommentsEncoder;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;
use models\UserModel;

class LexDbeDtoCommentsEncoder extends JsonEncoder {

	public function encodeIdReference($key, $model) {
        if ($key == 'createdByUserRef' || $key == 'modifiedByUserRef') {
            $user = new UserModel();
            if ($user->exists($model->asString())) {
                $user->read($model->asString());
                return array(
                    'id' => $user->id->asString(),
                    'avatar_ref' => $user->avatar_ref,
                    'name' => $user->name,
                    'username' => $user->username);
            } else {
                return '';
            }
        } else {
            return $model->asString();
        }
    }

    public static function encodeModel($model) {
        $e = new LexDbeDtoCommentsEncoder();
        return $e->_encode($model);
    }
}
class LexDbeDto {

    /**
     * @param string $projectId
     * @param bool $returnOnlyUpdates
     * @throws \Exception
     * @return array
     */
	public static function encode($projectId, $lastFetchTime = null) {
        $data = array();
		$project = new LexiconProjectModel($projectId);
		$entriesModel = new LexEntryListModel($project, $lastFetchTime);
		$entriesModel->readForDto();
		$entries = $entriesModel->entries;

        $commentsModel = new LexCommentListModel($project, $lastFetchTime);
        $commentsModel->readAsModels();

        // fix up entryRef - maybe move this to a custom encoder?
//        foreach ($commentsModel->entries as $key => $comment) {
//            $commentsModel->entries[$key]['entryRef'] = $commentsModel->entries[$key]['entryRef']->{'$id'};
//        }

        if (!is_null($lastFetchTime)) {
            $deletedEntriesModel = new LexDeletedEntryListModel($project, $lastFetchTime);
            $deletedEntriesModel->read();
            $data['deletedEntryIds'] = array_map(function ($e) {return $e['id']; }, $deletedEntriesModel->entries);

            $deletedCommentsModel = new LexDeletedCommentListModel($project, $lastFetchTime);
            $deletedCommentsModel->read();
            $data['deletedCommentIds'] = array_map(function ($c) {return $c['id']; }, $deletedCommentsModel->entries);
        }

        $lexemeInputSystems = $project->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems;

		usort($entries, function ($a, $b) use ($lexemeInputSystems) {
            $lexeme1 = $a[LexiconConfigObj::LEXEME];
            $lexeme1Value = '';
            foreach ($lexemeInputSystems as $ws) {
                if (array_key_exists($ws, $lexeme1) && $lexeme1[$ws]['value'] != '') {
                    $lexeme1Value = $lexeme1[$ws]['value'];
                    break;
                }
            }
            $lexeme2 = $b[LexiconConfigObj::LEXEME];
            $lexeme2Value = '';
            foreach ($lexemeInputSystems as $ws) {
                if (array_key_exists($ws, $lexeme2) && $lexeme2[$ws]['value'] != '') {
                    $lexeme2Value = $lexeme2[$ws]['value'];
                    break;
                }
            }
            return (strtolower($lexeme1Value) > strtolower($lexeme2Value)) ? 1 : -1;
		});



		$data['entries'] = $entries;
        $data['comments'] = LexDbeDtoCommentsEncoder::encodeModel($commentsModel);
        $data['timeOnServer'] = time(); // future use for offline syncing

		return $data;
	}
}

?>
