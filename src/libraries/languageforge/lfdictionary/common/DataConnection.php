<?php
namespace libraries\lfdictionary\common;

/**
 * Implements a data connection to a MySQL database.
 * TODO Delete.
 */
class DataConnection {

	/**
	 * @var mysqli
	 */
	public $mysqli;

	/**
	 * constructor function this will run when we call the class 
	 */
	function __construct($database, $user, $password, $host = 'localhost') {
		//pass the hostname, user, password, database names here if static
		$this->mysqli = @new \mysqli($host, $user, $password, $database);
		if (mysqli_connect_errno()) {
			throw new \Exception("MySql connection failed: " . mysqli_connect_error());
		}
	}
	
	function __destruct() {
		$this->mysqli->close();
	}

	/**
	 * Returns mysqli->error
	 * @return string
	 */
	function error() {
		return $this->mysqli->error();
	}

	/**
	 * Execute query 
	 * @return \mysqli_result
	 */
	function execute($sql) {
		$result = $this->mysqli->query($sql);
		if ($result === false) {
			throw new \Exception("SQL Error: '" . $this->mysqli->error . "' sql: '" . $sql . "'");
		}
		return $result;
	}

	/**
	 * Fetch Row
	 * @param \mysqli_result
	 * @return array
	 */
	function fetchrow($result) {
		if ($result === false) {
			return array(); // Return an empty array, causing any subsequent foreach to fail gracefully.
		}
		return $result->fetch_array(MYSQLI_ASSOC);
	}
	
	/**
	 * Fetch an associative array
	 * @param \mysqli_result
	 * @return array
	 */
	function fetch_assoc($result) {
		if ($result === false) {
			return array(); // Return an empty array, causing any subsequent foreach to fail gracefully.
		}
		return $result->fetch_array(MYSQLI_ASSOC);
	}
	
	function insert_id() {
		return $this->mysqli->insert_id;
	}
	
}

?>