<?php

namespace Api\Model\Languageforge\Semdomtrans\Command;

use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Languageforge\SemDomTransProjectModel;

class SemDomTransItemCommands
{
    /**
     * Updates the SemdomTransItem - handles logic for switching from needs revision or suggested to draft
     * @param array $data
     * @param string $projectId
     * @return string
     */
	public static function update($data, $projectId) {
		$projectModel = new SemDomTransProjectModel($projectId);
		$previousItemModel = new SemDomTransItemModel($projectModel);
		if ($data["id"] != '') {
		    $previousItemModel->read($data['id']);
		}
		
		$guid = $data["xmlGuid"];
		$s = new SemDomTransItemModel($projectModel);
		$s->xmlGuid = $guid;
		$s->readByProperty("xmlGuid", $guid);
		
	
		$s->key = $data["key"];
		$s->name->translation = $data["name"]["translation"];
		$s->name->status = $data["name"]["status"];
		if ($previousItemModel->id != '' 
		    && $previousItemModel->name->translation != $data["name"]["translation"]
		    && intval($data["name"]["status"]) != SemDomTransStatus::Approved) {
		    $s->name->status = SemDomTransStatus::Draft;
		}
		
		
		$s->description->translation = $data["description"]["translation"];
		$s->description->status = $data["description"]["status"];
		if ($previousItemModel->id != '' 
		    && $previousItemModel->description->translation != $data["description"]["translation"]
		    && intval($data["description"]["status"]) != SemDomTransStatus::Approved) {
		        $s->description->status = SemDomTransStatus::Draft;
	    }
		
		for ($i = 0; $i < count($s->questions); $i++ ) {
			$s->questions[$i]->question->translation = $data["questions"][$i]["question"]["translation"];
			$s->questions[$i]->question->status = $data["questions"][$i]["question"]["status"];
			if ($previousItemModel->id != '' 
		        && $previousItemModel->questions[$i]->question->translation != $data["questions"][$i]["question"]["translation"]
			    && intval($data["questions"][$i]["question"]["status"]) != SemDomTransStatus::Approved) {
			       $s->questions[$i]->question->status  = SemDomTransStatus::Draft;
		    }
			
			$s->questions[$i]->terms->translation = $data["questions"][$i]["terms"]["translation"];
			$s->questions[$i]->terms->status = $data["questions"][$i]["terms"]["status"];
			
			if ($previousItemModel->id != '' 
		        && $previousItemModel->questions[$i]->terms->translation != $data["questions"][$i]["terms"]["translation"]
			    && intval($data["questions"][$i]["terms"]["status"]) != SemDomTransStatus::Approved) {
			        $s->questions[$i]->terms->status  = SemDomTransStatus::Draft;
		    }
		}
		
		for ($i = 0; $i < count($s->searchKeys); $i++ ) {
			$s->searchKeys[$i]->translation = $data["searchKeys"][$i]["translation"];
			$s->searchKeys[$i]->status = $data["searchKeys"][$i]["status"];
			
			if ($previousItemModel->id != '' 
		        && $previousItemModel->searchKeys[$i]->translation != $data["searchKeys"][$i]["translation"]
			    && intval($data["searchKeys"][$i]["status"]) != SemDomTransStatus::Approved) {
			        $s->searchKeys[$i]->status  = SemDomTransStatus::Draft;
		    }
		}
		
		$s->write();
		return $s->id->asString();
	}
}
