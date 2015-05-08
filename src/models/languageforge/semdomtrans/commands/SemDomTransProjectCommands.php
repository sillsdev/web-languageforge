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
use Palaso\Utilities\FileUtilities;
use libraries\languageforge\semdomtrans\SemDomXMLExporter;

class SemDomTransProjectCommands
{
    public static function getOpenSemdomProjects($userId) {
        $projects = new ProjectListModel();
        $projects->read();
        $semdomProjects = [];
        foreach($projects->entries as $p) {
            $project = new ProjectModel($p["id"]);
            if ($project->appName == LfProjectModel::SEMDOMTRANS_APP 
                 && !array_key_exists($userId, $project->users)
                 && !array_key_exists($userId, $project->userJoinRequests)) {
                     
                $sp = new SemDomTransProjectModel($p["id"]);
                if ($sp->languageIsoCode != "en") {
                        $semdomProjects[] = $sp;
                }
            }
        }

        return $semdomProjects;
    }
   
    public static function exportProjects() {
        $zip = new ZipArchive();
        $filename =  $path = APPPATH . "resources/languageforge/semdomtrans/GoogleTranslateHarvester/exportedProjects.zip";
        
        if ($zip->open($filename, ZipArchive::CREATE)!==TRUE) {
            exit("cannot open <$filename>\n");
        }
        else {
            $projects = SemDomTransProjectCommands::getOpenSemdomProjects($userId);
            foreach($projects->entries as $p) {
                $e = new SemDomXMLExporter($p, false, ($p->isSourceLanguage && $p->languageIsoCode != 'en'), !$p->isSourceLanguage);
                $e->run();
                $zip->addFile($p->$xmlFilePath , basename($p->$xmlFilePath));
            }
            $zip->close();
        }
    }
    public static function doesGoogleTranslateDataExist($languageIsoCode) {
        $path = APPPATH . "resources/languageforge/semdomtrans/GoogleTranslateHarvester/semdom-google-translate-$languageIsoCode.txt";
        return file_exists($path);
    }
    

    public static function checkProjectExists($languageCode) {
        $project = new SemDomTransProjectModel();
        $project->readByCode($languageCode);
        if (Id::isEmpty($project->id)) {
            return true;
        } else {
            return false;
        }
    }

    public static function createProject($languageCode, $languageName, $useGoogleTranslateData, $userId, $website, $semdomVersion = SemDomTransProjectModel::SEMDOM_VERSION) {

        $projectCode = SemDomTransProjectModel::projectCode($languageCode, $semdomVersion);
        $projectName = SemDomTransProjectModel::projectName($languageCode, $languageName, $semdomVersion);
        $projectID =  ProjectCommands::createProject($projectName, $projectCode, LfProjectModel::SEMDOMTRANS_APP, $userId, $website);

        $project = new SemDomTransProjectModel($projectID);
        $project->languageIsoCode = $languageCode;
        $project->isSourceLanguage = false;
        $project->semdomVersion = $semdomVersion;

        // by default all created projects have English as their source.  A future feature would allow creating projects off of other source languages
        $englishProject = SemDomTransProjectModel::getEnglishProject($semdomVersion);
        $project->sourceLanguageProjectId->id = $englishProject->id->asString();

        $project->preFillFromSourceLanguage($useGoogleTranslateData);
        return $project->write();
    }

}
