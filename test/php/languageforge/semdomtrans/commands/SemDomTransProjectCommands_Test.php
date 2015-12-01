<?php
use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransProjectCommands;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Library\Languageforge\Semdomtrans\SemDomXMLExporter;
use Api\Model\ProjectListModel;
use Api\Library\Languageforge\Semdomtrans;
use Api\Model\ProjectModel;
use Api\Library\Shared\Website;
use Api\Library\Languageforge\Semdomtrans\SemDomXMLImporter;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class SemDomTransProjectCommands_Test extends UnitTestCase {

    public function testCreateProject_englishProjectExists_newProjectCreatedAndPrefilledFromSourceProject()
    {
        $e = new SemDomMongoTestEnvironment();
        $e->cleanPreviousProject('es');
        $user1Id = $e->createUser('u', 'u', 'u');
        $englishProject = $e->getEnglishProjectAndCreateIfNecessary();
        $newProject = $e->createSemDomProject('es', "Spanish", $user1Id);

        $this->assertEqual($newProject->sourceLanguageProjectId->asString(), $englishProject->id->asString());
        $this->assertEqual($newProject->isSourceLanguage, false);
        $listModel = new SemDomTransItemListModel($newProject);
        $listModel->read();
        $this->assertEqual($listModel->count, 36);
    }

    public function testSemDomImportExport_ImportExportPreserveXMLFile() {
        $e = new SemDomMongoTestEnvironment();
        $e->clean();
        $englishProject = $e->getEnglishProjectAndCreateIfNecessary();
        $exporter = new SemDomXMLExporter($englishProject, false,  true, false);
        $exporter->run();
        $sourcePath = $englishProject->xmlFilePath;
        $destinationPath = $englishProject->getAssetsFolderPath() . "/" . $englishProject->projectCode . "Export.xml";

        $sourceStr = trim(file_get_contents($sourcePath), "\n");
        $sourceArr = explode("\n", $sourceStr);
        $destStr = trim(file_get_contents($destinationPath), "\n");
        $destArr = explode("\n", $destStr);
        for ($i = 0; $i < count($destArr); $i++) {
            if ($i % 500 == 0) {
                $this->assertEqual($sourceArr[$i], $destArr[$i]);
                //$this->assertEqual(substr($sourceArr[$i], 0, -1), $destArr[$i]);
            }
        }

        $e->clean();
    }
}
