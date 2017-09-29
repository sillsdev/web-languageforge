<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Library\Shared\LanguageData;
use Api\Library\Shared\Website;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\ProjectModel;

class ImportOtherLanguageSemDomProjects
{
    public function run($userId, $mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "Import Other Language Semantic Domain Projects\n\n";

        $languages = array('es', 'fa', 'hi', 'id', 'km', 'ko', 'ne', 'pt', 'ru', 'te', 'th', 'ur', 'zh-CN');
        //$languages = array('es', 'fa');

        $languageData = new LanguageData();
        $languageData->read();



        foreach ($languages as $lang) {
            $projectCode = SemDomTransProjectModel::projectCode($lang);
            $languageName = $languageData->getLanguage($lang)->name;
            $projectName = SemDomTransProjectModel::projectName($lang, $languageName);
            $existingProject = new SemDomTransProjectModel();
            $existingProject->readByCode($lang);
            if ($existingProject->id->asString() != '') {
                $message .= "$projectName already exists!  Removing...\n";
                if (!$testMode) {
                    $existingProject->remove();
                }
            }
            if (!$testMode) {
                $projectId = self::_createEmptyProject($lang, $languageName, $userId);
                $projectModel = ProjectModel::getById($projectId);
                $xmlFilePath = APPPATH . "resources/languageforge/semdomtrans/LocalizedLists-$lang.xml";
                $projectModel->importFromFile($xmlFilePath);
            }
            $message .= "Finished importing the $projectName \n";
        }
        return $message;
    }

    private static function _createEmptyProject($languageCode, $languageName, $userId) {
        $website = Website::get();

        $projectCode = SemDomTransProjectModel::projectCode($languageCode);
        $projectName = SemDomTransProjectModel::projectName($languageCode, $languageName);
        $projectID =  ProjectCommands::createProject($projectName, $projectCode, LfProjectModel::SEMDOMTRANS_APP, $userId, $website);

        $project = new SemDomTransProjectModel($projectID);
        $project->languageIsoCode = $languageCode;
        $project->isSourceLanguage = false;
        $project->semdomVersion = SemDomTransProjectModel::SEMDOM_VERSION;

        // by default all created projects have English as their source.  A future feature would allow creating projects off of other source languages
        $englishProject = SemDomTransProjectModel::getEnglishProject();
        $project->sourceLanguageProjectId->id = $englishProject->id->asString();

        return $project->write();
    }
}
