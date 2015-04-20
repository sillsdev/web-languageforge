<?php

namespace models\languageforge\semdomtrans\dto;

use models\languageforge\semdomtrans\SemDomTransItemListModel;

use models\languageforge\semdomtrans\SemDomTransItemModel;

use models\languageforge\SemDomTransProjectModel;

use models\mapper\JsonEncoder;
use models\languageforge\lexicon\LexCommentListModel;
use models\languageforge\lexicon\dto\LexDbeDtoCommentsEncoder;
use models\languageforge\semdomtrans\SemDomTransWorkingSetListModel;

class SemDomTransEditDto
{
    public static function encode($projectId, $userId, $lastFetchTime = null)
    {
        $data = array();
        $project = new SemDomTransProjectModel($projectId);
        if ($project->sourceLanguageProjectId == null) {
               $sourceProject = new SemDomTransProjectModel();
               $sourceProject->projectCode="semdom-en-$project->semdomVersion";
               $sourceProject->readByProperty("projectCode", $sourceProject->projectCode);
        } else {
            $sourceProject = new SemDomTransProjectModel($project->sourceLanguageProjectId);
        }
        $items = new SemDomTransItemListModel($project, $lastFetchTime);
        $items->read();
        $targetItems = $items->entries;
        //print_r($targetItems);
        
        $sourceItemsModel = new SemDomTransItemListModel($sourceProject, $lastFetchTime);
        $sourceItemsModel->read();
        $sourceItems = $sourceItemsModel->entries;
        //print_r($sourceItems);
        $sourceItemsByKey = array();
        foreach ($sourceItems as $item) {
            $sourceItemsByKey[$item['key']] = $item;
        }
        
        // suplement the target language data with source language values
        
        $sourceLanguageIsIncomplete = false;
        foreach ($targetItems as $i => $item) {
            foreach ($item as $outerProp => $outerValue) {
                if (is_array($outerValue) && key_exists('translation', $outerValue)) {
                    if ($sourceItemsByKey[$item['key']][$outerProp]['translation'] != '') {
                        $targetItems[$i][$outerProp]['source'] = $sourceItemsByKey[$item['key']][$outerProp]['translation'];
                    } else {
                           $sourceLanguageIsIncomplete = true;
                    }
                };
                if ($outerProp == 'searchKeys') {
                    foreach ($outerValue as $innerProp => $innerValue) {
                        if (array_key_exists($innerProp, $sourceItemsByKey[$item['key']][$outerProp]))
                        {
                            if ($sourceItemsByKey[$item['key']][$outerProp][$innerProp]['translation'] != '') {
                                $targetItems[$i][$outerProp][$innerProp]['source'] = $sourceItemsByKey[$item['key']][$outerProp][$innerProp]['translation'];
                            } else {
                                   $sourceLanguageIsIncomplete = true;
                            }
                        }
                    }
                } else if ($outerProp == 'questions') {
                    foreach ($outerValue as $innerProp => $innerValue) {
                        if (array_key_exists($innerProp, $sourceItemsByKey[$item['key']][$outerProp])) {
                            if ($sourceItemsByKey[$item['key']][$outerProp][$innerProp]['question']['translation'] != '') {
                                $targetItems[$i][$outerProp][$innerProp]['question']['source'] = $sourceItemsByKey[$item['key']][$outerProp][$innerProp]['question']['translation'];
                            } else {
                                   $sourceLanguageIsIncomplete = true;
                            }
                            
                            if ($sourceItemsByKey[$item['key']][$outerProp][$innerProp]['terms']['translation'] != '') {
                                $targetItems[$i][$outerProp][$innerProp]['terms']['source'] = $sourceItemsByKey[$item['key']][$outerProp][$innerProp]['terms']['translation'];
                            } else {
                                $sourceLanguageIsIncomplete = true;
                            }
                        }
                        else {
                            $sourceLanguageIsIncomplete = true;
                        }
                    }
                }
            }
        }
        $data['sourceLanguageIsIncomplete'] = $sourceLanguageIsIncomplete;
        
        $commentsModel = new LexCommentListModel($project, $lastFetchTime);
        $commentsModel->readAsModels();
        $encodedModels = LexDbeDtoCommentsEncoder::encode($commentsModel);
        $data['comments'] = $encodedModels["entries"];
        
        $workingSets = new SemDomTransWorkingSetListModel($project, $lastFetchTime);
        $workingSets->read();
        $data["workingSets"] = $workingSets->entries;
        
        if (!is_null($lastFetchTime)) {
            /* TODO: implement deleted Items list model
            $deletedEntriesModel = new LexDeletedEntryListModel($project, $lastFetchTime);
            $deletedEntriesModel->read();
            $data['deletedEntryIds'] = array_map(function ($e) {return $e['id']; }, $deletedEntriesModel->entries);
            */

            $deletedCommentsModel = new LexDeletedCommentListModel($project, $lastFetchTime);
            $deletedCommentsModel->read();
            $data['deletedCommentIds'] = array_map(function ($c) {return $c['id']; }, $deletedCommentsModel->entries);
        }


        $data['items'] = $targetItems;

        $data['timeOnServer'] = time(); // future use for offline syncing

        return $data;
    }
}
