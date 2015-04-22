<?php

namespace libraries\shared\scripts\migration;

use libraries\languageforge\semdomtrans\SemDomXMLImporter;
use models\languageforge\SemDomTransProjectModel;

class ImportEnglishSemDomProject
{
    public function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "Import English Semantic Domain Project\n\n";
        $semdomVersion = 4;
        $projectCode = "semdom-en-$semdomVersion";
        $englishXmlFilePath = APPPATH . 'resources/languageforge/semdomtrans/SemDom_en.xml';

        $englishProject = new SemDomTransProjectModel();
        $englishProject->readByProperties(array("projectCode" => $projectCode));

        // TODO: if the english project exists, empty it out entirely and re-import
        if ($englishProject->id->asString() != "") {

        } else {

        }


        if ($englishProject->id->asString() == "") {
            $projectModel = new SemDomTransProjectModel();
            $projectModel->projectCode = $projectCode;
            $projectModel->projectName = "English (en) Semantic Domain Project";
            $projectModel->languageIsoCode = 'en';
            $projectModel->semdomVersion = $semdomVersion;

            $newXmlFilePath = $projectModel->getAssetsFolderPath() . '/' . basename($englishXmlFilePath);
            if (!file_exists($projectModel->getAssetsFolderPath())) {
                mkdir($projectModel->getAssetsFolderPath());
            }

            $message .= "copying $englishXmlFilePath to $newXmlFilePath\n";
            copy($englishXmlFilePath, $newXmlFilePath);
            $projectModel->xmlFilePath = $newXmlFilePath;
            if (!$testMode) {
                $projectModel->write();
            }

            $importer = new SemDomXMLImporter($newXmlFilePath, $projectModel, $testMode, true);
            $importer->run();
            $message .= "Finished Importing the English project";

        } else {
            $message .= "Stopping import: English project already exists!";
        }

        return $message;
    }
}
