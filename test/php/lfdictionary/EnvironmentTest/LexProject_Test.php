<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once 'LexProjectTestEnvironment.php';
use libraries\lfdictionary\environment\ProjectStates;

use libraries\lfdictionary\environment\ProjectState;

use models\ProjectModel;

require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

use libraries\lfdictionary\environment\LexProject;
class TestOfLexProject extends UnitTestCase {

	function testConstructor_NormalizedProjectPath() {
		$e = new LexProjectTestEnvironment();
		$model = new ProjectModel();
		$model->projectname = "SomeProject";
		$model->projectCode = ProjectModel::makeProjectCode("qaa", "SomeProject", "dictionary");
		$e->cleanup($model->projectCode);
		$project = new LexProject($model, '/tmp');
		$this->assertEqual('/tmp/qaa-someproject-dictionary/', $project->projectPath);
	}
	
	function testConstructor_StateFileMissing_StateReady() {
		$e = new LexProjectTestEnvironment();
		$model = new ProjectModel();
		$model->projectname = "SomeProject";
		$model->projectCode = ProjectModel::makeProjectCode("qaa", "SomeProject", "dictionary");
		$e->cleanup($model->projectCode);
		$project = new LexProject($model, '/tmp');
		$project->createNewProject();
		unlink(LexProject::stateFolderPath() . $model->projectCode . '.state'); // remove state file
		$project2 = new LexProject($model, '/tmp');
		$this->assertEqual($project2->projectState->getState(), ProjectStates::Ready);
	}
	
	function testConstructor_ExistingProject_ProjectStateReadOk() {
		$e = new LexProjectTestEnvironment();
		$model = new ProjectModel();
		$model->projectname = "SomeProject";
		$model->projectCode = ProjectModel::makeProjectCode("qaa", "SomeProject", "dictionary");
		$e->cleanup($model->projectCode);
		$project = new LexProject($model, '/tmp');
		$project->createNewProject();
		$project->projectState->setState(ProjectStates::Locked);
		$project2 = new LexProject($model, '/tmp');
		$this->assertEqual($project2->projectState->getState(), ProjectStates::Locked);
	}
	
	function testCreateNewProject_ExistingProject_Throws() {
		$e = new LexProjectTestEnvironment();
		$e->lexProject->createNewProject();
		$this->expectException('Exception');
		$e->lexProject->createNewProject();
	}
	
	function testCreateNewProject_NewProject_Created() {
		$e = new LexProjectTestEnvironment();
		$e->lexProject->createNewProject();
		$this->assertFileExists($e->lexProject->projectPath . $e->projectCode . ".lift");
	}
	
	function tetGetLiftFilePath_NoLiftFile_NewDefaultCreated() {
		$e = new LexProjectTestEnvironment();
		$expected = $e->projectName . '.lift';
		$project = new LexProject($e->projectCode, $e->projectWorkPath);
		$result = $project->getLiftFilePath();
		$this->assertEqual($e->getProjectPath() . $expected, $result);
	}
	
	function testGetLiftFilePath_LiftFileWithProjectName_ReturnsPath() {
		$e = new LexProjectTestEnvironment('lifttest');
		$liftFilePath = $e->getProjectPath() . $e->projectCode . '.lift';
		$e->lexProject->createNewProject();
		$this->assertEqual($liftFilePath, $e->lexProject->getLiftFilePath());
	}
	
	function testGetLiftFilePath_TwoLiftfiles_ReturnsProjectLiftFile() {
		$e = new LexProjectTestEnvironment('lifttest');
		$liftFilePath = $e->getProjectPath() . $e->projectCode . '.lift';
		$randomLiftFilePath = $e->getProjectPath() . "randomLift.lift";
		$e->lexProject->createNewProject();
		file_put_contents($randomLiftFilePath, "<lift />");
		$this->assertEqual($liftFilePath, $e->lexProject->getLiftFilePath());
	}
	
	function testGetLiftFilePath_LiftFileWithRandomName_ReturnsPath() {
		$e = new LexProjectTestEnvironment('lifttest');
		$liftFilePath = $e->getProjectPath() . $e->projectCode . '.lift';
		$randomLiftFilePath = $e->getProjectPath() . "randomLift.lift";
		$e->lexProject->createNewProject();
		file_put_contents($randomLiftFilePath, "<lift />");
		unlink($liftFilePath);
		$this->assertEqual($randomLiftFilePath, $e->lexProject->getLiftFilePath());
	}
	
	function testGetCurrentHash_SomeRepo_ReturnsHash() {
		$e = new LexProjectTestEnvironment();
		$e->lexProject->createNewProject();
		$e->addFile("File1.txt", "Contents");
		$result = $e->lexProject->getCurrentHash();
		$this->assertEqual(12, strlen($result));
	}
	
	private function assertFileExists($filePath) {
		$this->assertTrue(file_exists($filePath), sprintf("Expected file not found '%s'", $filePath));
	}
	
}

?>