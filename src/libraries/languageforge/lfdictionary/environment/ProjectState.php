<?php
namespace libraries\lfdictionary\environment;

require_once(dirname(__FILE__) . '/../Config.php');
//require_once(LF_LIBRARY_PATH . "/lfbase/Loader.php");

/**
 * An enum for the available project states
 */
class ProjectStates
{
	const Ready     = 'Ready';
	const Error		= 'Error';
	const Importing = 'Importing';
	const Creating  = 'Creating';
	const Locked    = 'Locked';
}

/**
 * 
 * The state file looks like this:
 * version=1
 * state=Ready|Error|Importing|Creating|Locked
 * message=Some text
 *
 */
class ProjectState
{
	
	const Version = '1';	
	
	/**
	 * @var string 
	 */
	private $_projectName;
	
	/**
	 * @var string
	 */
	private $_state;
	
	/**
	 * @var string
	 */
	private $_message;
	
	/**
	 * @param string $projectName
	 */
	public function __construct($projectName) {
		$this->_projectName = $projectName;
	}
	
	/**
	 * @return string
	 */
	public function filePath() {
		return LexProject::stateFolderPath(). $this->_projectName . '.state';
	}
	
	private function writeState() {
		$filePath = $this->filePath();
		$f = fopen($filePath, 'w');
		if (!$f) {
			throw new \Exception("Unable to open '$filePath' for writing.");
		}
		fwrite($f, 'version=' . self::Version . "\n");
		fwrite($f, 'state=' . $this->_state . "\n");
		fwrite($f, 'message=' . $this->_message . "\n");
		fclose($f);
	}
	
	private function readState() {
		$filePath = $this->filePath();
		if (!file_exists($filePath)) {
			$this->writeState();
		}
		$f = fopen($filePath, 'r');
		if (!$f) {
			throw new \Exception("Unable to open '$filePath' for reading.");
		}
		$lines = file($filePath);
		foreach ($lines as $line) {
			$token = explode('=', $line, 2);
			$key = trim($token[0]);
			$value = trim($token[1]);
			switch ($key) {
				case 'version':
					if ($value != self::Version) {
						throw new \Exception("State version '$value' cannot be read");
					}
					break;
				case 'state':
					$this->_state = $value;
					break;
				case 'message':
					$this->_message = $value;
			}
		}
		fclose($f);
	}
	
	/**
	 * @param string $state
	 * @param string $message
	 */
	public function setState($state, $message = null) {
		if (is_array($message)) {
			$message = implode('; ', $message);
		}
		$this->_state = $state;
		$this->_message = $message;
		$this->writeState();
	}
	
	public function getState() {
		if (!isset($this->_state)) {
			$this->readState();
		}
		return $this->_state;
	}
	
	public function getMessage() {
		if (!isset($this->_state)) {
			$this->readState();
		}
		return $this->_message;
	}
	
}

?>