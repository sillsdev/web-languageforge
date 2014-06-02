<?php
use environment\LanguageDepotImporter;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');

require_once(SOURCE_PATH . 'environment/LanguageDepotImporter.php');

/**
 * This test can be somewhat long running as it does a number of real clones from language depot.
 *
 */
class TestOfLanguageDepotImporter extends UnitTestCase {

	const StatePath = '/tmp/state/';
	const WorkPath = '/tmp/work/';
	const ProjectName = 'tet-test-dictionary';
	
	function setUp() {
		@mkdir(self::StatePath);
		@mkdir(self::WorkPath);
	}
	
	function tearDown() {
		self::deldir(self::WorkPath);
		self::deldir(self::StatePath);
	}
	
	private static function deldir($dir) {
		$currentDirectory = opendir($dir);
		while($entryname = readdir($currentDirectory)) {
			if(is_dir("$dir/$entryname") and ($entryname != "." and $entryname!="..")) {
				self::deldir("${dir}/${entryname}");
			} elseif($entryname != "." and $entryname!="..") {
				unlink("${dir}/${entryname}");
			}
		}
		closedir($currentDirectory);
		rmdir($dir);
	}
	
	/**
	 * @return LanguageDepotImporter
	 */
	private function languageDepotImporter() {
		$environment = new \environment\LanguageDepotImportEnvironment();
		$environment->StateRootPath = self::StatePath;
		$environment->WorkRootPath = self::WorkPath;
		$environment->ProjectPathName = self::ProjectName;
		return new \environment\LanguageDepotImporter(0, $environment); 
	}
	
	function testCloneRepository_FolderNotEmpty_ReportsError() {
		@mkdir(self::WorkPath . self::ProjectName);
		file_put_contents(self::WorkPath . self::ProjectName . '/BogusFile', "Bogus data");
		$importer = self::languageDepotImporter();
		$asyncRunner = $importer->cloneRepository('test', 'tset23', 'testpal-dictionary');
		$this->assertTrue($asyncRunner->isRunning());
		while (!$importer->isComplete()) {
			usleep(500 * 1000);
		}
		$result = $importer->error();
		$this->assertEqual(array(0 => "abort: destination '/tmp/work/tet-test-dictionary' is not empty", 1 => "Command exited with non-zero status 255"), $result);
	}
	
	function testCloneRepository_CreatesAsyncFileProgressToCompletion() {
		$importer = self::languageDepotImporter();
		$asyncRunner = $importer->cloneRepository('test', 'tset23', 'testpal-dictionary');
		$this->assertTrue($asyncRunner->isRunning());
		while (!$importer->isComplete()) {
			$progress = $importer->progress();
			//$this->assertTrue($progress >= 0 && $progress <= 100, "Progress out of bounds '$progress'");
			usleep(500 * 1000);
		}
		$progress = $importer->progress();
		$this->assertEqual($progress, 100.0);
		$result = $importer->error();
		$this->assertFalse($result, "Clone error: " . implode(", ", $result));
	}
	
	const TestProgress = <<<EOD
	using http://hg-public.languagedepot.org/testpal-dictionary
	http auth: user test, password ******
	sending between command
	http auth: user test, password ******
	sending heads command
	http auth: user test, password ******
	requesting all changes
	sending changegroup command
	http auth: user test, password ******
	adding changesets
	changesets: 1 chunks
	add changeset 6b0ff1287b24
	adding manifests
	manifests: 1/1 chunks (100.00%)
	adding file changes
	adding C.WeSayUserConfig revisions
	files: 1/6 chunks (16.67%)
	adding WritingSystems/en.ldml revisions
	files: 2/6 chunks (33.33%)
	adding WritingSystems/idchangelog.xml revisions
	files: 3/6 chunks (50.00%)
	adding WritingSystems/tet.ldml revisions
EOD;

	function testProgress_WithFile_LatestProgressCorrect() {
		$filePath = self::StatePath . self::ProjectName . '.async';
		file_put_contents($filePath, self::TestProgress);
		
		$importer = self::languageDepotImporter();
		$progress = $importer->progress();
		$this->assertEqual(50.00, $progress);
		@unlink($filePath);
	}
	
	const ErrorMessage = <<<EOD
	using http://hg-public.languagedepot.org/tha-food
	http auth: user cambell, password *******
	sending between command
	http auth: user cambell, password *******
	abort: destination '/var/lib/languageforge//work/ma-cp_test9-dictionary' is not empty
	Command exited with non-zero status 255
	AsyncCompleted: 0:01.64
EOD;
	
	function testError_WithError_Correct() {
		$filePath = self::StatePath . self::ProjectName . '.async';
		file_put_contents($filePath, self::ErrorMessage);
		
		$importer = self::languageDepotImporter();
		$isComplete = $importer->isComplete();
		$this->assertTrue($isComplete);
		$error = $importer->error();
		$this->assertEqual(2, count($error));
		@unlink($filePath);
	}

}

?>