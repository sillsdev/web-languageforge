<?php

namespace models\languageforge\semdomtrans\commands;

use libraries\shared\Website;

use Palaso\Utilities\CodeGuard;
use libraries\scriptureforge\sfchecks\Email;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\UserModel;
use models\shared\dto\ManageUsersDto;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\shared\rights\Domain;
use models\languageforge\semdomtrans\SemDomTransItemListModel;
use models\shared\rights\ProjectRoles;
use models\sms\SmsSettings;
use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\ProjectListModel;
use models\languageforge\LfProjectModel;
use models\commands\ProjectCommands;
use models\languageforge\semdomtrans\SemDomTransQuestion;

class SemDomTransProjectCommands
{
	public static function getOpenSemdomProjects() {
		$projects = new ProjectListModel();
		$projects->read();
		$semdomProjects = [];
		foreach($projects->entries as $p) {
			$project = new ProjectModel($p["id"]);
			if ($project->appName == LfProjectModel::SEMDOMTRANS_APP) {
				$sp = new SemDomTransProjectModel($p["id"]);
				$semdomProjects[] = $sp;
			}
		}
		
		return $semdomProjects;
	}
	
	public static function preFillProject($projectId) {			
		$projectModel = new SemDomTransProjectModel($projectId);
		$englishProject = new SemDomTransProjectModel();
		$englishProject->readByProperties(array("languageIsoCode" => "en", "semdomVersion" => $projectModel->semdomVersion));
    	$projectModel->sourceLanguageProjectId = $englishProject->id->asString();
    	$projectModel->write();
    	
    	$xmlFilePath = "/var/www/host/sil/lfsite/docs/semdom/SemDom_en.xml";
    	$newXmlFilePath = $projectModel->getAssetsFolderPath() . '/' . basename($xmlFilePath);
    	if (!file_exists($projectModel->getAssetsFolderPath())) {
    		mkdir($projectModel->getAssetsFolderPath());
    	}
    	copy($xmlFilePath, $newXmlFilePath);
    	$projectModel->newXmlFilePath = $newXmlFilePath;
    	$projectModel->write();
    	
    	$englishItems = new SemDomTransItemListModel($englishProject);
    	$englishItems->read();
    	foreach ($englishItems->entries as $item) {
    		$newItem = new SemDomTransItemModel($projectModel);
    		$newItem->key = $item['key'];
    		foreach ($item['questions'] as $q) {
    			$newq = new SemDomTransQuestion("aa", "aa"); 
    			$newItem->questions[] = $newq;
    		}
    		foreach ($item['searchKeys'] as $sk) {
    			$newsk = new SemDomTransTranslatedForm();
    			$newItem->searchKeys[] = $newsk;
    		}
    		$newItem->xmlGuid = $item['xmlGuid'];
    		$newItem->write();   			
    	}
    	
    	return $projectModel;
	}
}
