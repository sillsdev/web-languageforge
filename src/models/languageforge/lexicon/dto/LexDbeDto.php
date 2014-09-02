<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\LexCommentListModel;
use models\languageforge\lexicon\LexDeletedEntryListModel;
use models\languageforge\lexicon\LexDeletedCommentListModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;
use models\shared\UserGenericVoteModel;
use models\UserModel;

class LexDbeDtoCommentsEncoder extends JsonEncoder
{
    public function encodeIdReference($key, $model)
    {
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

    public static function encode($model)
    {
        $e = new LexDbeDtoCommentsEncoder();

        return $e->_encode($model);
    }
}
class LexDbeDto
{
    /**
     * @param  string     $projectId
     * @param $userId
     * @param  null       $lastFetchTime
     * @throws \Exception
     * @internal param bool $returnOnlyUpdates
     * @return array
     */
    public static function encode($projectId, $userId, $lastFetchTime = null)
    {
        $data = array();
        $project = new LexiconProjectModel($projectId);
        $entriesModel = new LexEntryListModel($project, $lastFetchTime);
        $entriesModel->readForDto();
        $entries = $entriesModel->entries;

        $commentsModel = new LexCommentListModel($project, $lastFetchTime);
        $commentsModel->readAsModels();
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

        $data['timeOnServer'] = time(); // future use for offline syncing

        return $data;
    }
}
