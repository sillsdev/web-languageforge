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

class LexDbeDto {

    /**
     * @param string $projectId
     * @param bool $returnOnlyUpdates
     * @throws \Exception
     * @return array
     */
	public static function encode($projectId, $lastFetchTime = null) {
		$project = new LexiconProjectModel($projectId);
		$entriesModel = new LexEntryListModel($project, $lastFetchTime);
		$entriesModel->readForDto();
		$entries = $entriesModel->entries;

        $deletedEntriesModel = new LexDeletedEntryListModel($project, $lastFetchTime);
        $deletedEntriesModel->read();

        $commentsModel = new LexCommentListModel($project, $lastFetchTime);
        $commentsModel->read();

        $deletedCommentsModel = new LexDeletedCommentListModel($project, $lastFetchTime);
        $deletedCommentsModel->read();

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



		$data = array();
		$data['entries'] = $entries;
        $data['deletedEntryIds'] = array_map(function ($e) {return $e['id']; }, $deletedEntriesModel->entries);
        $data['comments'] = $commentsModel->entries;
        $data['deletedCommentIds'] = array_map(function ($c) {return $c['id']; }, $deletedCommentsModel->entries);
        $data['timeOnServer'] = time(); // future use for offline syncing

		return $data;
	}
}

?>
