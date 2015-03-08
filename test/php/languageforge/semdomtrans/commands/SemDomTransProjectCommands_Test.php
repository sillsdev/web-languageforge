<?php
use models\languageforge\SemDomTransProjectModel;
use libraries\languageforge\semdomtrans\SemDomXMLExporter;
use models\ProjectListModel;
use libraries\languageforge\semdomtrans;
use models\ProjectModel;
use libraries\shared\Website;
use libraries\languageforge\semdomtrans\SemDomXMLImporter;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class SemDomTransProjectCommands_Test extends UnitTestCase {
	public function testSemDomImportExport_ImportExportPreserveXMLFile() {
		$e = new SemDomMongoTestEnvironment();
		$e->clean();
		$englishProject = $e->importEnglishProject(20);
		$exporter = new SemDomXMLExporter($englishProject, false,  true, false);
		$exporter->run();
		$sourcePath = "/var/www/host/sil/lfsite/docs/semdom/semdom lists/SemDom_en.xml";
		$destPath = $englishProject->getAssetsFolderPath() . "/" . $englishProject->projectCode . "Export.xml";
		
		$sourceStr = trim(file_get_contents($sourcePath), "\n");
		$sourceArr = explode("\n", $sourceStr);
		$destStr = trim(file_get_contents($destPath), "\n");
		$destArr = explode("\n", $destStr);
		for ($i = 0; $i < count($destArr); $i++) {
			$this->assertEqual(substr($sourceArr[$i], 0, -1), $destArr[$i]);
		}
		
		$e->clean();
	}
}
