<?php

namespace libraries\shared\scripts\migration;

use libraries\languageforge\semdomtrans\SemDomXMLImporter;
use models\languageforge\SemDomTransProjectModel;

class ImportOtherLanguageSemDomProjects
{
    public function run($userId, $mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "Import Other Language Semantic Domain Projects\n\n";

        $languages = array('es', 'fa', 'hi', 'id', 'km', 'ko', 'ne', 'pt', 'ru', 'te', 'th', 'ur', 'zh-CN');
        //$languages = array('es', 'fa');

        foreach ($languages as $lang) {
            $projectCode = SemDomTransProjectModel::projectCode($lang);
            $existingProject = new SemDomTransProjectModel();
            $existingProject->readByCode($lang);
            if ($existingProject->id->asString() != '') {
                $message .= "$projectCode project already exists!  Skipping...\n";
                continue;
            }
            if (!$testMode) {
                $projectModel = SemDomTransProjectModel::createProject($lang, $userId);
                $xmlFilePath = APPPATH . "resources/languageforge/semdomtrans/LocalizedLists-$lang.xml";
                $projectModel->importFromFile($xmlFilePath);
            }
            $message .= "Finished importing the $lang project\n";
        }
        return $message;
    }
}
