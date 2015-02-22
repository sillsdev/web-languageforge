<?php

namespace models\languageforge\semdomtrans\commands;

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
use models\languageforge\semdomtrans\SemDomTransFieldReference;
use models\languageforge\semdomtrans\SemDomTransCommentModel;

class SemDomTransCommentsCommands
{
	public static function update($data, $projectId) {
		$projectModel = new SemDomTransProjectModel($projectId);
		
		$comment = new SemDomTransCommentModel($projectModel);
		//$comment->read($data["id"]);
		$comment->content = $data["content"];
		$comment->entryRef = $data["regarding"]["semDomItemRef"];
		
		$fldn = $data["regarding"]["fieldName"];
		$srcv = $data["regarding"]["fieldValue"]["source"];
		$transv = $data["regarding"]["fieldValue"]["translation"];
		$status = $data["regarding"]["fieldValue"]["status"];
		
		$comment->entryRef = new SemDomTransFieldReference($fldn, $srcv, $transv, $status);
		
		$comment->write();
		return $comment->id;
	}
	
}