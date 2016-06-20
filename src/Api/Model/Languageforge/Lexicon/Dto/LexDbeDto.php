<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\Config\LexiconConfigObj;
use Api\Model\Languageforge\Lexicon\LexCommentListModel;
use Api\Model\Languageforge\Lexicon\LexDeletedEntryListModel;
use Api\Model\Languageforge\Lexicon\LexDeletedCommentListModel;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Shared\UserGenericVoteModel;

class LexDbeDto
{
    /**
     * @param  string     $projectId
     * @param $userId
     * @param  null       $lastFetchTime
     * @throws \Exception
     * @return array
     */

    const MAX_ENTRIES_PER_REQUEST = 5000;

    public static function encode($projectId, $userId, $lastFetchTime = null, $offset = 0)
    {
        $data = array();
        $project = new LexiconProjectModel($projectId);
        if ($lastFetchTime) {
            $entriesModel = new LexEntryListModel($project, $lastFetchTime);
            $entriesModel->readForDto();
            $commentsModel = new LexCommentListModel($project, $lastFetchTime);
            $commentsModel->readAsModels();
        } else {
            $entriesModel = new LexEntryListModel($project, null, self::MAX_ENTRIES_PER_REQUEST, $offset);
            $entriesModel->readForDto();
            $commentsModel = new LexCommentListModel($project, null, self::MAX_ENTRIES_PER_REQUEST, $offset);
            $commentsModel->readAsModels();

            $data['itemTotalCount'] = ($entriesModel->totalCount > $commentsModel->totalCount) ? $entriesModel->totalCount : $commentsModel->totalCount;
            $data['itemCount'] = ($entriesModel->count > $commentsModel->count) ? $entriesModel->count : $commentsModel->count;
            $data['offset'] = $offset;
        }
        $entries = $entriesModel->entries;
        $encodedComments = LexDbeDtoCommentsEncoder::encode($commentsModel);
        $data['comments'] = $encodedComments['entries'];
        /*
        $commentsModel->read();
        $data['comments'] = $commentsModel->entries;
        */

        $votes = new UserGenericVoteModel($userId, $projectId, 'lexCommentPlusOne');
        $votesDto = array();
        foreach ($votes->votes as $vote) {
            $votesDto[$vote->ref->id] = true;
        }
        $data['commentsUserPlusOne'] = $votesDto;

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
                    // '\P{xx} matches all characters without the Unicode property XX. L is the Unicode property "letter".
                    $lexeme1Value = preg_replace('/^\P{L}+/', '', $lexeme1Value); // Strip non-letter characters from front of word for sorting
                    break;
                }
            }
            $lexeme2 = $b[LexiconConfigObj::LEXEME];
            $lexeme2Value = '';
            foreach ($lexemeInputSystems as $ws) {
                if (array_key_exists($ws, $lexeme2) && $lexeme2[$ws]['value'] != '') {
                    $lexeme2Value = $lexeme2[$ws]['value'];
                    $lexeme2Value = preg_replace('/^\P{L}+/', '', $lexeme2Value); // Strip non-letter characters from front of word for sorting
                    break;
                }
            }

            return (strtolower($lexeme1Value) > strtolower($lexeme2Value)) ? 1 : -1;
        });

        $data['entries'] = $entries;

        $data['timeOnServer'] = time(); // for offline syncing

        return $data;
    }
}
