<?php

namespace libraries\lfdictionary\dashboardtool;

use libraries\lfdictionary\environment\LexProject;

require_once(dirname(__FILE__)   . '/../../../helpers/loader_helper.php');
require_once(dirname(__FILE__) . '/ActivityFieldType.php');
if (!defined('APPPATH'))
{
	// this is run from command line, so in this case we don't have APPPATH
	define('APPPATH', dirname(__FILE__)   . '/../../../');
}

use libraries\lfdictionary\dashboardtool\DashboardToolFactory;
use libraries\lfdictionary\dashboardtool\DashboardDbType;
use models\ProjectModel;

class DashboardCounterExtracter
{
	private $args = array();
	
	private $projectId;
	
	private $projectPath;
	
	function __construct($args) {
		
		
		$this->args = $args;

		if (count($this->args) > 0) {
			$this->readProjectId();
		} else {
			echo "argument missing (--pid=xx or --start=yyyy-mm-dd --end=yyyy-mm-dd)", PHP_EOL;
		}	
	}
	function process() {
		
		
		if ($this->projectId == null) {
			
			echo "Error project node ID not found", PHP_EOL;
			return;
		}
		$errorMessage = array ();
		if (count($this->args) == 1) {
			//$this->readFile();
			$errorMessage[]= "argument --start=yyyy-mm-dd missing".PHP_EOL;
			$errorMessage[]= "argument --end=yyyy-mm-dd missing". PHP_EOL;
		} else if (count($this->args) > 1){
		
			
			if (!array_key_exists('start', $this->args) ||
			array_key_exists('start', $this->args) && strlen($this->args['start']) == 0) {
				$errorMessage[]= "argument --start=yyyy-mm-dd missing".PHP_EOL;
			} else {
				$start = $this->args['start'];
			}
			
			if (!array_key_exists('end', $this->args) ||
			array_key_exists('end', $this->args) && strlen($this->args['end']) == 0) {
				$errorMessage[]= "argument --end=yyyy-mm-dd missing". PHP_EOL;
			} else {
				$end = $this->args['end'];
			}

			
			
			try {
				$this->projectModel = new ProjectModel($this->projectId);
				$this->projectPath = PROJECTS_HG_ROOT_FOLDER. $this->projectModel->projectName;
				$liftFilePath = glob(PROJECTS_HG_ROOT_FOLDER. $this->projectModel->projectName."/*.lift");
					
				if (count($liftFilePath) >= 1) {
					$this->liftFilePath = $liftFilePath[0];
			
				} else {
					throw new \Exception("No lift file found in: ".PROJECTS_HG_ROOT_FOLDER . $this->projectModel->projectName);
				}
					
			} catch (Exception $e) {
				echo 'Caught exception: ',  $e->getMessage(), PHP_EOL;
				return;
			}
			//echo "start $start end $end repository $res",PHP_EOL;
			$this->readHistoricalData($start, $end, $this->projectPath, $this->liftFilePath);
			return;
		}
		
		if (count($errorMessage) > 0) {
			foreach ($errorMessage as &$value) {
				echo $value;
			}
			return;
		}

				
	}
	
	function readHistoricalData($start, $end, $resPath, $liftFilePath) {

		$historicalHgDataFetcher = new HistoricalHgDataFetcher($resPath);
		
		// fetch hasf from HG
		$hgLogNodeResult = $historicalHgDataFetcher->logNode($start, $end);

		if (count($hgLogNodeResult) == 0) {
			echo "no log received.", PHP_EOL;
		}
		foreach ($hgLogNodeResult as $value) {

			$hgLogs = split(";", $value);
			$hgHash = $hgLogs[0];
			$hgDate = $hgLogs[1];
			$hgRev = $hgLogs[2];
			$timestamp = mktime(0, 0, 0, date("m", strtotime($hgDate)), date("d", strtotime($hgDate)), date("y", strtotime($hgDate)));
			//echo "timestamp is : ".date("d/m/Y H:i:s",$timestamp)."", PHP_EOL;
			//echo "hgHash = ".$hgHash." date = ".$date, PHP_EOL;
			$doc = new \DOMDocument;
			$filepath = "/tmp/".md5(uniqid()).".temp";
			$catResult = $historicalHgDataFetcher->cat($hgHash, $liftFilePath, $filepath);
			//echo "Get data from revesion $hgHash.", PHP_EOL;
			//echo "And wirte to file $filepath already.", PHP_EOL;

			$this->liftFilePath = $filepath;
			
			$insertResult = false;
			if (filesize($filepath) == 0) {
				return;
			} else {
				//echo "file size ".filesize($filepath), PHP_EOL;
					
				$insertResult = $this->readAndInsertCounters($this->liftFilePath, $timestamp, $hgRev, $hgHash);					
			}	
			
			if ($insertResult) {
				if (unlink($filepath)) {
					//echo "file ".$filepath." deleted.", PHP_EOL;
				}
			}
					
		}
		
		//echo var_dump($fetchHistoricalDataFromHgRep->logNode());
		return;
	}
	
	function readProjectId() {
		if (!array_key_exists('pid', $this->args) ||
		array_key_exists('pid', $this->args) && strlen($this->args['pid']) == 0) {
			echo "argument --pid=xx missing", PHP_EOL;
			return;
		} else {
			$this->projectId = $this->args['pid'];
		}
	}
	
	function readFile() {
		
		
		try {
			$this->projectModel = new ProjectModel($this->projectId);
			$projectPath = LexProject::workFolderPath() . $this->projectModel->projectSlug;
		
			$filePath = glob(LexProject::workFolderPath() . $this->projectModel->projectName."/*.lift");
			
			if (count($filePath) >= 1) {
				
// 				$historicalHgDataFetcher = new HistoricalHgDataFetcher($this->projectPath);
// 				$nodeRevResult = $historicalHgDataFetcher->logNodeRev();
					
// 				if (count($nodeRevResult) < 1) {
// 					throw new \Exception("No hg log found .");
// 				}
					
// 				$hgRev = 0;
// 				$hgHash = "";
// 				foreach ($nodeRevResult as $value) {
// 					$hgLogs = split(";", $value);
// 					$hgRev = $hgLogs[0];
// 					$hgHash = $hgLogs[1];
// 				}
				
				$this->liftFilePath = $filePath[0];
				
				$timestamp = mktime(0, 0, 0, date("m"), date("d"), date("y"));
				
				$this->readAndInsertCounters($this->liftFilePath, $timestamp, null);
			} else {
				throw new \Exception("No lift file found in: " . LexProject::workFolderPath() . $this->projectModel->projectName);
			}
		
		} catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), PHP_EOL;
			return;
		}
	}
	
	function readAndInsertCounters($liftFilePath, $timestamp, $versoin, $hash) {
		
		$doc = new \DOMDocument;
		$doc->preserveWhiteSpace = false;
		if (!$doc->Load($liftFilePath)) {
			return;
		}
		
		$xpath = new \DOMXPath($doc);
		
		$entries = $xpath->query("entry");
		$meaning = $xpath->query("entry/sense");
		$speech = $xpath->query("entry/sense/grammatical-info");
		$example = $xpath->query("entry/sense/example");
		
		if ($hash != null) {
			echo "".date("Y-m-d",$timestamp)." $hash $entries->length $meaning->length $speech->length $example->length", PHP_EOL;
		}
		return $this->insertUpdate($timestamp, $entries->length, $meaning->length, $speech->length, $example->length, $versoin, $hash);
		
	}

	
	function insertUpdate($timestamp, $entries, $meaning, $speech, $example, $hg_version, $hg_hash) {

		//echo "Sum fo entry count ".$this->_entries->length."<br/>";
		//echo "Sum of meaning count ".$this->_meaning->length."<br/>";
		//echo "Sum of part of speech count ".$this->_speech->length."<br/>";
		//echo "Sum of example count ".$this->_example->length;
		
		$DashboardCommands = DashboardToolFactory::getDashboardCommands(DashboardDbType::DB_MONGODB);
		
		$result = $DashboardCommands->insertUpdateCounter($this->projectId, ActivityFieldType::COUNT_ENTRY, $entries, $timestamp, $hg_version, $hg_hash);
		$result = $DashboardCommands->insertUpdateCounter($this->projectId, ActivityFieldType::COUNT_MEANING, $meaning, $timestamp, $hg_version, $hg_hash);
		$result = $DashboardCommands->insertUpdateCounter($this->projectId, ActivityFieldType::COUNT_PARTOFSPEECH, $speech, $timestamp, $hg_version, $hg_hash);
		$result = $DashboardCommands->insertUpdateCounter($this->projectId, ActivityFieldType::COUNT_EXAMPLE, $example, $timestamp, $hg_version, $hg_hash);
	}
	
	
}
?>