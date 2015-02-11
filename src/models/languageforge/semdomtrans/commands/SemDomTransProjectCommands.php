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

use models\shared\rights\ProjectRoles;
use models\sms\SmsSettings;
use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\ProjectListModel;
use models\languageforge\LfProjectModel;

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
}
