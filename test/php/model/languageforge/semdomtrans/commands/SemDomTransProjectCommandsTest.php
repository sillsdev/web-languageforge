<?php

use Api\Library\Languageforge\Semdomtrans\SemDomXMLExporter;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
//use PHPUnit\Framework\TestCase;

class SemDomTransProjectCommandsTest extends PHPUnit_Framework_TestCase
{
    public function testCreateProject_englishProjectExists_newProjectCreatedAndPrefilledFromSourceProject()
    {
        $environ = new SemDomMongoTestEnvironment();
        $environ->cleanPreviousProject('es');
        $user1Id = $environ->createUser('u', 'u', 'u');
        $englishProject = $environ->getEnglishProjectAndCreateIfNecessary();
        $newProject = $environ->createSemDomProject('es', 'Spanish', $user1Id);

        $this->assertEquals($englishProject->id->asString(), $newProject->sourceLanguageProjectId->asString());
        $this->assertEquals(false, $newProject->isSourceLanguage);
        $listModel = new SemDomTransItemListModel($newProject);
        $listModel->read();
        $this->assertEquals(36, $listModel->count);
    }

    public function testSemDomImportExport_ImportExportPreserveXMLFile() {
        $environ = new SemDomMongoTestEnvironment();
        $environ->clean();
        $englishProject = $environ->getEnglishProjectAndCreateIfNecessary();
        $exporter = new SemDomXMLExporter($englishProject, false,  true, false);
        $exporter->run();
        $sourcePath = $englishProject->xmlFilePath;
        $destinationPath = $englishProject->getAssetsFolderPath() . DIRECTORY_SEPARATOR .
            $englishProject->projectCode . 'Export.xml';

        $sourceStr = trim(file_get_contents($sourcePath), "\n");
        $sourceArr = explode("\n", $sourceStr);
        $destStr = trim(file_get_contents($destinationPath), "\n");
        $destArr = explode("\n", $destStr);
        for ($i = 0; $i < count($destArr); $i++) {
            if ($i % 500 == 0) {
                $this->assertEquals($sourceArr[$i], $destArr[$i]);
                //$this->assertEqual(substr($sourceArr[$i], 0, -1), $destArr[$i]);
            }
        }

        $environ->clean();
    }
}
