<?php

use models\rights\Roles;

require_once(TestPath . 'common/MockProjectModel.php');

class MongoTestEnvironment
{
	
	/**
	 * @var MongoDB
	 */
	private $_db;
	
	
	public function __construct() {
		$this->_db = \models\mapper\MongoStore::connect(SF_DATABASE);
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
	public function createUser($username, $name, $email, $role = Roles::USER) {
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
	 * @return ProjectModel
	 */
	public function createProject($name, $site = 'scriptureforge') {
		$projectModel = new models\ProjectModel();
		$projectModel->projectname = $name;
		$projectModel->siteName = $site;
		$projectModel->themeName = 'default';
		$this->cleanProjectEnvironment($projectModel);
		$projectModel->write();
		return $projectModel;
	}
	
	public function createProjectSettings($name, $site = 'scriptureforge') {
		$projectModel = new models\ProjectSettingsModel();
		$projectModel->projectname = $name;
		$projectModel->siteName = $site;
		$projectModel->themeName = 'default';
		$this->cleanProjectEnvironment($projectModel);
		$projectModel->write();
		return $projectModel;
	}
	
	private function cleanProjectEnvironment($projectModel) {
		// clean out old db if it is present
		$projectDb = \models\mapper\MongoStore::connect($projectModel->databaseName());
		foreach ($projectDb->listCollections() as $collection) {
			$collection->drop();
		}
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