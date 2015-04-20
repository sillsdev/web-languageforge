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

class SemDomTransItemCommands
{
    public static function update($data, $projectId) {
        $projectModel = new SemDomTransProjectModel($projectId);
        $guid = $data["xmlGuid"];
        $s = new SemDomTransItemModel($projectModel);
        $s->xmlGuid = $guid;
        $s->readByProperty("xmlGuid", $guid);
        
    
        $s->key = $data["key"];
        $s->name->translation = $data["name"]["translation"];
        $s->description->translation = $data["description"]["translation"];
        
        for ($i = 0; $i < count($s->questions); $i++ ) {
            $s->questions[$i]->question->translation = $data["questions"][$i]["question"]["translation"];
            $s->questions[$i]->terms->translation = $data["questions"][$i]["terms"]["translation"];
        }
        
        for ($i = 0; $i < count($s->searchKeys); $i++ ) {
            $s->searchKeys[$i]->translation = $data["searchKeys"][$i]["translation"];
        }
        
        return $s->write();
    }
}