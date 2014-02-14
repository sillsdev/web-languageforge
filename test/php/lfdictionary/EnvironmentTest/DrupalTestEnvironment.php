<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');

// TODO this class is way out of date. CP 2013-03
class DrupalTestEnvironment {

	/**
	 * @var string
	 */
	var $_path;
	var $_sqlFilePath;

	function __construct() {
	
		$this->_sqlFilePath = TEST_PATH .'/data/dbbck/lfweb.sql';
	}

	/**
	 * Connecting Database
	 */
	function setconnection() {
		// TODO Redo the database connection in data connector style CP 2012-09
		$this->_connection = new \libraries\lfdictionary\common\DataConnection(DB_SERVER, DB_USER, DB_PASS, DB_NAME);
		$this->_connection->open();
	}
	
	/**
	 * Connecting Drupal Database
	 */
	static function setDrupalConnection() {
	
		global $db_url;
		if (!is_array($db_url)) {
			$default_db = $db_url;
			$db_url = array('default' => $default_db);
		}
		//set up the new database value.
		$sqlUri = 'mysqli://' . DB_USER . ':' . DB_PASS . '@' . DB_SERVER . '/' . DB_NAME;
		$db_url['mydb'] = $sqlUri;		
		
		db_set_active(DB_NAME);    // activation & execution same as explained above
	}
	
	/**
	 * Close Drupal Database Connection
	 */
	function closeDrupalConnection() {
		db_set_active('default'); // set back to original
	}
	
	/**
	 * Setup database to be used during testing
	 */
	function import() {
		$dbhost = DB_SERVER;
		$dbuser = DB_USER;
		$dbpass = DB_PASS;
		$dbname = DB_NAME;
		
// 		$sqlimport = "mysql -h $dbhost -u$dbuser -p$dbpass $dbname < $this->_sqlFilePath";
// 		system($sqlimport);
		
		\libraries\lfdictionary\common\LFDrupal::loadDrupal();		

		//Drupal DB Connection Open
		$this->setDrupalConnection();
	}
	
	/**
	 * Clear up Drupal database connection
	 */
	function dispose() {
		//Removing all the table from dummy database
// 		$db_connection = $this->setconnection();
// 		$result = mysql_query("SHOW tables");
// 		if ($result) {
// 			$c = mysql_num_rows($result);
// 			for ($i = 0; $i < $c; $i++) {
// 				$tableName = mysql_result($result, $i, 0);
// 				mysql_query("drop table " . $tableName);
// 			}
// 		}
		
		//Drupal DB Connection Close
		$this->closeDrupalConnection();
	}
	
	/**
	 * Remove Project Folder
	 */
	function rrmdir($dir) {
		$objects = scandir($dir);
		foreach ($objects as $object) {
			if ($object != "." && $object != "..") {
				if (filetype($dir."/".$object) == "dir") $this->rrmdir($dir."/".$object); else unlink($dir."/".$object);
			}
		}
		reset($objects);
		rmdir($dir);
	}
	
	static function setDrupalTestDataConnection() {
	
		$file =  DrupalPath . 'sites/default/settings.php';
		$getString = file_get_contents($file);
		$putString = str_replace("mysqli://lfweb:123456@localhost/lfweb", "mysqli://lfweb:123456@localhost/lfdictionary_test", $getString);
		file_put_contents($file, $putString);
		$DrupalTestEnvironment = new DrupalTestEnvironment();
		$DrupalTestEnvironment->import();
	}
	
	function revertBackTestDataConnection() {
	
		$file =  DrupalPath . 'sites/default/settings.php';
		$getString = file_get_contents($file);
		$putString = str_replace("mysqli://lfweb:123456@localhost/lfdictionary_test", "mysqli://lfweb:123456@localhost/lfweb", $getString);
		file_put_contents($file, $putString);		
	}
}

?>