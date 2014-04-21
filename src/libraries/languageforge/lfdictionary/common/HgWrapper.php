<?php
namespace libraries\lfdictionary\common;

/*
 * Wrapper functions for Mercurial
 * @see AsyncRunner
 * REVIEWED CP 2013-12: OK.
 */
class HgWrapper {
	
	/**
	 * @var String
	 */
	var $_repositoryPath;
	
	/**
	 * @var Array
	 */
	var $_result;
	
	public function __construct($repositoryPath) {
		$this->_repositoryPath = $repositoryPath;
		$this->_result = array();
	}
	
	// To clone from repository
	public function cloneRepository($sourcePath, $asyncRunner = null) {		
		$command = "hg clone --debug $sourcePath $this->_repositoryPath";
		if ($asyncRunner) {
			$asyncRunner->run($command);
		} else {
			exec($command, $this->_result);
		}
	}
	
	// To pull from repository
	public function pull()	{		
		$command = "hg pull $this->_repositoryPath";
		exec($command, $this->_result);
		$this->update();
	}
	
	// To update 
	public function update() {
		$command = "hg update $this->_repositoryPath";
		exec($command, $this->_result);
	}
	
	public function init() {
		$command = "hg init $this->_repositoryPath";
		self::execute($command);	
	}

	public function addFile($fileName) {
		$command = "add $fileName";
		$this->hg($command);
	}

	public function commit($message) {
		// TODO Enhance. Should also pass in the username to use for the commit.
		$command = "commit -u languageforge -m '$message'";
		$this->hg($command);
	}
	
	public static function getHgHashFull($path) {
		$oldPath=getcwd();
		chdir($path);
		$result = shell_exec('hg --debug id --id');
		chdir($oldPath);
		return $result;
	}
	
	public static function getHgHashShort($path) {
		return substr(HgWrapper::getHgHashFull($path), 0, 12);
	}
	
	/**
	 * Runs hg $command in the repository folder 
	 * @param string $commnad
	 */
	private function hg($command) {
		$command = sprintf("hg -R \"%s\" ", $this->_repositoryPath) . $command;
		return self::execute($command);
	}
	
	/**
	 * Executes $command storing the results in $_result
	 * @param string $command
	 * @return string
	 */
	private static function execute($command) {
		$output = '';
		exec($command, $output);
// 		error_log('exec ' . $command);
// 		error_log('exec output ' . var_export($output, true));
// 		echo $command . '<br/>';
		return $output;
	}
	/**
	 * get current hash of hg revsion
	 * @throws \Exception
	 */
	public function getCurrentHash() {
		$command = 'parent --template "{node|short}\n"';
		$output = $this->hg($command);
		if (count($output) == 0) {
			throw new \Exception(sprintf("No output from command '%s' in repo '%s'", $command, $this->_repositoryPath));
		}
		return $output[0];
	}
	
	/**
	 * 
	 * get hg log in a specified date range
	 * @param string $start
	 * @param string $end
	 * @return multitype:
	 */
	function logNode($start, $end) {
		$command = "hg log -R $this->_repositoryPath --date \"$start to $end\" --template \"{node};{date|isodate};{rev}\n\"";
		exec($command, $this->_result);
		return $this->_result;
	}
	
	/**
	 * 
	 * get file in revsion into specified folder
	 * @param int $revision
	 * @param string $liftFilePath
	 * @param string $tempFilePath
	 * @return multitype:
	 */
	function cat($revision, $liftFilePath, $tempFilePath) {
		$command = "hg cat  -R $this->_repositoryPath -r$revision $liftFilePath > $tempFilePath";
		exec($command, $this->_result);
		return $this->_result;
	}
	
	/**
	 * 
	 * get hg reversion and hash
	 * @return multitype:
	 */
	function logNodeRev() {
		$command = "hg log -R $this->_repositoryPath -l 1 --template '{rev};{node}\n'";
		exec($command, $this->_result);
		return $this->_result;
	}
	
	/**
	 * Checks the hg output given in $output. Returns an array of error messages.
	 * @param string $output
	 * @return string[]
	 */
	public static function errorMessageFilter($output) {
		$result = array();
		$lines = explode("\n", $output);
		foreach ($lines as $line) {
			if (strpos($line, "abort") !== false or
				strpos($line, "invalid") !== false or
				strpos($line, "not found") !== false or
				strpos($line, "such file or directory") !== false or
				strpos($line, "exited with non-zero status 255") !== false or
				strpos($line, "exited with non-zero status 127") !== false or
				strpos($line, "failed to run") !== false
			) {
				$result[] = $line;
			}
		}
		return $result;
	}
	
	
}

?>