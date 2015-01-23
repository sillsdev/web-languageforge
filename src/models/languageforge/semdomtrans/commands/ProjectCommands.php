<?php

namespace models\semdomtrans\commands;

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

use models\shared\rights\ProjectRoles;
use models\sms\SmsSettings;
use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;

class ProjectCommands
{
	public static function createSourceProject($sourceLanguage, $semdoms, $questions) {
		$projectModel = new SemDomTransProjectModel();
		foreach($semdoms as $k => $v) {
			$semdomItem = new SemDomTransItemModel($projectModel);
			$semdomItem->key = $k;
			$semdomItem->name = new TranslationForm($v["name"]);
			$semdomItem->description = new SemDomTransTranslatedForm($v["description"]);
			$searchKeys = $v['searchKeys'];
			foreach ($searchKeys as $searchKey)
			{
				array_push($semdomItem->searchKeys, new SemDomTransTranslatedForm($searchKey));
			}
			
			$questionSemdom = $questions[$k];
			foreach ($questionSemdom as $qst)
			{
				array_push($semdomItem->questions, new SemDomTransTranslatedForm($qst));
			}			
			
			$semdomItem->write();
		}
	}
}
