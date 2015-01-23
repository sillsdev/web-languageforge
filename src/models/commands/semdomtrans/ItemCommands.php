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
use models\languageforge\semdomtrans\TranslatedForm;

class ItemCommands
{
	public static function updateSemdomTranslationItem($projectId, $object) {

		$projectModel = new \models\languageforge\SemDomTransProjectModel($projectId);
		$semdomItemModel = new \models\languageforge\semdomtrans\SemDomTransItemModel($projectModel);
		$isSemdomItem = ($object['id'] == '');
		if (!$isSemdomItem) {
			$textModel->read($object['id']);
		}
		JsonDecoder::decode($semdomItemModel, $object);
		$semdomItemModel->write();
	}
}
