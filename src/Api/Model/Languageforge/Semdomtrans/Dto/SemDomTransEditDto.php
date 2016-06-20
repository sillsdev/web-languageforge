<?php

namespace Api\Model\Languageforge\Semdomtrans\Dto;

use Api\Model\Languageforge\Lexicon\Dto\LexDbeDtoCommentsEncoder;
use Api\Model\Languageforge\Lexicon\LexCommentListModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Languageforge\Semdomtrans\SemDomTransWorkingSetListModel;
use Api\Model\Languageforge\SemDomTransProjectModel;

class SemDomTransEditDto
{
    const MAX_ENTRIES_PER_REQUEST = 5000;
    
    /**
     * Returns encoded Semantic Domain Editor Dto:
     * 1) Loads all items of target project (langauge we are translating into)
     * 2) Loads all items of source project (language we are translating from)
     * 3) Sets values from source projects as sources on target items
     * @param string $projectId
     * @param string $userId
     * @param string $lastFetchTime
     * @param number $offset
     * @return multitype:boolean number multitype: multitype:string  Ambigous <\Api\Model\Mapper\string;, multitype:, string, Ambigous <multitype:, multitype:multitype: unknown >, Ambigous <multitype:, \stdClass, multitype:multitype: unknown >, Ambigous <string, multitype:NULL string >>
     */
    public static function encode($projectId, $userId, $lastFetchTime = null, $offset = 0)
    {
        $data = array();
        
        // load target project
        $project = new SemDomTransProjectModel($projectId);
        
        // load source project - if source language is not specified, set it to english
        if ($project->sourceLanguageProjectId == null) {
       		$sourceProject = new SemDomTransProjectModel();
       		$sourceProject->projectCode="semdom-en-$project->semdomVersion";
       		$sourceProject->readByProperty("projectCode", $sourceProject->projectCode);
        } else {
            $sourceProject = new SemDomTransProjectModel($project->sourceLanguageProjectId->asString());
        }
        
        // load target project items
        $items = new SemDomTransItemListModel($project, $lastFetchTime);
        $items->read();
        $targetItems = $items->entries;
        
        $sourceItemsModel = new SemDomTransItemListModel($sourceProject);
        $sourceItemsModel->read();
        $sourceItems = $sourceItemsModel->entries;
        //print_r($sourceItems);
        $sourceItemsByKey = array();
        foreach ($sourceItems as $item) {
        	$sourceItemsByKey[$item['key']] = $item;
        }
        
        // suplement the target language data with source language values
        
        $sourceLanguageIsIncomplete = false;
        // loop over all target items
        foreach ($targetItems as $i => $item) {
            // loop over all properties of target item
        	foreach ($item as $outerProp => $outerValue) {
        	    // make sure that the outer value is an array and that the translation for it exists
				if (is_array($outerValue) && key_exists('translation', $outerValue)) {
				    // source item has translation that is non empty, than set it as source of arget item
        			if ($sourceItemsByKey[$item['key']][$outerProp]['translation'] != '') {
			        	$targetItems[$i][$outerProp]['source'] = $sourceItemsByKey[$item['key']][$outerProp]['translation'];
        			} else {
       					$sourceLanguageIsIncomplete = true;
        			}
        		};
        		// handle special case of search keys
        		if ($outerProp == 'searchKeys') {
        		    // iterate over all search keys
        			foreach ($outerValue as $innerProp => $innerValue) {
        			    // check if corresponding source item has search keys
        				if (array_key_exists($innerProp, $sourceItemsByKey[$item['key']][$outerProp]))
        				{
        				    // if source item has search keys, and given search key has translation set on it
        				    // use that translation as source of target item search key
	        				if ($sourceItemsByKey[$item['key']][$outerProp][$innerProp]['translation'] != '') {
					        	$targetItems[$i][$outerProp][$innerProp]['source'] = $sourceItemsByKey[$item['key']][$outerProp][$innerProp]['translation'];
	        				} else {
	       						$sourceLanguageIsIncomplete = true;
	        				}
        				}
        			}
        		}
        		// handle special case of questions
        		else if ($outerProp == 'questions') {
        		    // iterate over all questions
        			foreach ($outerValue as $innerProp => $innerValue) {
        			    // check that 'questions' property exists on source item
        				if (array_key_exists($innerProp, $sourceItemsByKey[$item['key']][$outerProp])) {
        				    // if source item has questions, and given question has translation set on it
        				    // use that translation as source of target item question
	        				if ($sourceItemsByKey[$item['key']][$outerProp][$innerProp]['question']['translation'] != '') {
					        	$targetItems[$i][$outerProp][$innerProp]['question']['source'] = $sourceItemsByKey[$item['key']][$outerProp][$innerProp]['question']['translation'];
	        				} else {
	       						$sourceLanguageIsIncomplete = true;
	        				}
	        				
	        				// if source item has questions, and given question term has translation set on it
	        				// use that translation as source of target item question term
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
        
        // load comments
        $commentsModel = new LexCommentListModel($project, $lastFetchTime);
        $commentsModel->readAsModels();
        
        $encodedModels = LexDbeDtoCommentsEncoder::encode($commentsModel);
        $data['comments'] = $encodedModels["entries"];
        
        // load working sets
        $workingSets = new SemDomTransWorkingSetListModel($project, $lastFetchTime);
        $workingSets->read();
        $data["workingSets"] = $workingSets->entries;
        
       /*  if (!is_null($lastFetchTime)) {
        	
            $deletedCommentsModel = new LexDeletedCommentListModel($project, $lastFetchTime);
            $deletedCommentsModel->read();
            $data['deletedCommentIds'] = array_map(function ($c) {return $c['id']; }, $deletedCommentsModel->entries);
        }
        */

        $data['entries'] = $targetItems;

        $data['timeOnServer'] = time(); // future use for offline syncing
        
        $data["statuses"] = SemDomTransStatus::getSemdomStatuses();

        return $data;
    }
}
