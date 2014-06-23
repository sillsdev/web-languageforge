<?php

use models\ProjectModel;

use libraries\shared\Website;

use models\scriptureforge\SfchecksProjectModel;

use models\shared\rights\SiteRoles;

use models\languageforge\lexicon\LexiconProjectModel;
use models\shared\rights\ProjectRoles;

require_once(TestPath . 'common/MockProjectModel.php');

class MongoTestEnvironment
{
	
	/**
	 * @var MongoDB
	 */
	private $_db;
	
	/**
	 * @var Website
	 */
	public $website;
	
	
	public function __construct($domain = 'www.scriptureforge.org') {
		$this->_db = \models\mapper\MongoStore::connect(SF_DATABASE);
		$this->website = Website::get($domain);
	}

	/**
	 * Removes all the collections from the mongo database.
	 * Hopefully this is only ever called on the scriptureforge_test database.
	 */
	public function clean() {
		foreach ($this->_db->listCollections() as $collection)
		{
			$collection->drop();
		}
	}

	/**
	 * Querys the given $collection and returns a MongoCursor.
	 * @param string $collection
	 * @param array $query
	 * @param array $fields
	 * @return MongoCursor
	 */
	public function find($collection, $query, $fields = array()) {
		$collection = $this->_db->$collection;
		return $collection->find($query, $fields);
	}
	
	/**
	 * Writes a user to the users collection.
	 * @param string $username
	 * @param string $name
	 * @param string $email
	 * @return string id
	 */
	public function createUser($username, $name, $email, $role = SiteRoles::USER) {
		$userModel = new models\UserModel();
		$userModel->username = $username;
		$userModel->name = $name;
		$userModel->email = $email;
		$userModel->avatar_ref = $username . ".png";
		$userModel->role = $role;
		return $userModel->write();
	}
	
	/**
	 * Writes a project to the projects collection.
	 * @param string $name
	 * @param string $domain
	 * @return ProjectModel
	 */
	public function createProject($name) {
		$projectModel = new ProjectModel();
		$projectModel->projectName = $name;
		$projectModel->siteName = $this->website->domain;
		$this->cleanProjectEnvironment($projectModel);
		$projectModel->write();
		return $projectModel;
	}
	
	public function createProjectSettings($name) {
		$projectModel = new models\ProjectSettingsModel();
		$projectModel->projectName = $name;
		$projectModel->siteName = $this->website->domain;
		$this->cleanProjectEnvironment($projectModel);
		$projectModel->write();
		return $projectModel;
	}
	
	protected function cleanProjectEnvironment($projectModel) {
		// clean out old db if it is present
		$projectDb = \models\mapper\MongoStore::connect($projectModel->databaseName());
		foreach ($projectDb->listCollections() as $collection) {
			$collection->drop();
		}
		// clean up assets folder
		$folderPath = $projectModel->getAssetsFolderPath();
		$cleanupFiles = glob($folderPath . '/*');
		foreach ($cleanupFiles as $cleanupFile) {
			@unlink($cleanupFile);
		}
		@rmdir($folderPath);
	}
	
	/**
	 * Returns a string very much like those used for MongoIds
	 * @return string
	 */
	public static function mockId() {
		$id = new MongoId();
		return (string)$id;
	}
	
	/**
	 * Returns a string of utf-8 usx xml
	 * @return string
	 */
	public static function usxSample() {
		global $rootPath;
		$testFilePath = $rootPath . 'docs/usx/043JHN.usx';
		$usx = file_get_contents($testFilePath);
		return $usx;
	}
	
	public static function usxSampleWithNotes() {
		global $rootPath;
		$testFilePath = $rootPath . 'docs/usx/CEV_PSA001.usx';
		$usx = file_get_contents($testFilePath);
		return $usx;
	}
	
	public function inhibitErrorDisplay() {
		$this->_display = ini_get('display_errors');
		ini_set('display_errors', false);
	}
	
	public function restoreErrorDisplay() {
		ini_set('display_errors', $this->_display);
	}
	
	public function fixJson($input) {
		return json_decode(json_encode($input), true);
	}
		
}

class LexiconMongoTestEnvironment extends MongoTestEnvironment {
	
	public function __construct() {
		parent::__construct('www.languageforge.org');
	}
	
	public function createProject($name) {
		$projectModel = new LexiconProjectModel();
		$projectModel->projectName = $name;
		$projectModel->siteName = $this->website->domain;
		$this->cleanProjectEnvironment($projectModel);
		$projectModel->write();
		return $projectModel;
	}
	
}