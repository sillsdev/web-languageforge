<?php
namespace libraries\lfdictionary\common;

class AsyncRunner
{
	private $_baseFilePath;
	
	public function __construct($baseFilePath) {
		$this->_baseFilePath = $baseFilePath;
	}
	
	/**
	 * @param string $command The unescaped system command to run
	 */
	public function run($command) {
		$lockFilePath = $this->getLockFilePath();
		$command = escapeshellcmd($command);
		// The following command redirects all output (include output of the time command) to $finishFilename
		// The trailing ampersand makes the command run in the background
		// We touch the $finishFilename before execution to indicate that the command has started execution
		$command = "touch $lockFilePath; /usr/bin/time --append --output=$lockFilePath --format=\"AsyncCompleted: %E\" stdbuf -oL -eL $command > $lockFilePath 2>&1 &";
		exec($command);
	}

	/**
	 * @return bool
	 */
	public function isRunning() {
		return file_exists($this->getLockFilePath());
	}
	
	/**
	 * @return bool
	 */
	public function isComplete() {
		$lockFilePath = $this->getLockFilePath();
		if (!file_exists($lockFilePath)) {
			throw new \Exception("Lock file '$lockFilePath' not found, process is not running");
		}
		$data = file_get_contents($this->getLockFilePath());
		if (strpos($data, "AsyncCompleted") !== false || strpos($data, "/usr/bin/time: not found")) {
			return true;
		}
		return false;
	}
	
	/**
	 * @param bool $allowUnfinished
	 * @return string
	 * @throws Exception
	 */
	public function getOutput($allowUnfinished = false) {
		if (!$allowUnfinished && !$this->isComplete()) {
			throw new \Exception("Command on '$this->_baseFilePath' not yet complete.");
		}
		return file_get_contents($this->getLockFilePath());
	}
	
	/**
	 * Removes the .async lock file
	 */
	public function cleanUp() {
		if (file_exists($this->getLockFilePath())) {
			unlink($this->getLockFilePath());
		}
	}
	
	/**
	 * Returns the file path to the .async lock file
	 * @return string
	 */
	public function getLockFilePath() {
		return $this->_baseFilePath . '.async';
	}

}

?>