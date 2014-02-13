<?php
namespace libraries\lfdictionary\commands;

require_once(dirname(__FILE__) . '/../Config.php');

use libraries\lfdictionary\dashboardtool\DashboardDbType;
use libraries\lfdictionary\dashboardtool\DashboardToolFactory;
use libraries\lfdictionary\common\LoggerFactory;
use libraries\lfdictionary\dto\EntryListDTO;
class GetDashboardDataCommand {
	
	var $_store = NULL;
	
	var $_filePath;
	var $_projectId=0;
	var $_wordCount = 0;
	var $_posCount = 0;
	var $_meaningCount = 0;
	var $_exampleCount = 0;

	var $_actRange = 0;

	var $counterValuesArray = array();

	var $dashboardCommands;
	function __construct($lexStore, $projectId,$filePath, $actRange) {
		$this->_projectId = $projectId;
		$this->_filePath = $filePath;
		$this->_actRange = $actRange;
		$this->_store = $lexStore;
	}

	function execute(){
		// read the current counter values from the lift file
		$this->processFile();

		$result=new \libraries\lfdictionary\dto\DashboardActivitiesDTO();
		$result->setStatsExamplesCount($this->_exampleCount);
		$result->setStatsMeaningsCount($this->_meaningCount);
		$result->setStatsPOSCount($this->_posCount);
		$result->setStatsWordCount($this->_wordCount);

		//$this->_actRange = 5;
		$start = mktime(0, 0, 0, date("m"), date("d")-$this->_actRange, date("y"));
		$end = mktime(23, 59, 59, date("m"), date("d"), date("y"));

		$entryActivitiesArray = array ();
		$definitionActivitiesArray = array ();
		$partOfSpeechActivitiesArray = array ();
		$exampleActivitiesArray = array ();
		
		$activityDateArray = array ();

		$this->counterValuesArray['COUNT_ENTRY'] = 0;
		$this->counterValuesArray['COUNT_MEANING'] = 0;
		$this->counterValuesArray['COUNT_PARTOFSPEECH'] = 0;
		$this->counterValuesArray['COUNT_EXAMPLE'] = 0;

		$this->dashboardCommands = DashboardToolFactory::getDashboardCommands(DashboardDbType::DB_MONGODB);
		$timeStamps;
		
		if ($this->_actRange == 0) {
			$timeStamps = $this->dashboardCommands->getAllTimeStamps($this->_projectId);
		} else {
			// read the historical counter values from the database
			$timeStamps = $this->dashboardCommands->getTimeStampsByDateRange($this->_projectId, $start, $end);
		}
		//echo var_dump($timeStamps);
		if ($timeStamps != null && count($timeStamps) > 0) {
			
			foreach ($timeStamps as $key => $value){

				$timestamp = $key;
				$currentTimestamp;
				$counters = $this->dashboardCommands->getCountersByTimeStamp($this->_projectId, $timestamp);
				
				$entryActivities = 0;
				$definitionActivities = 0;
				$partOfSpeechActivities = 0;
				$exampleActivities = 0;
				if ($counters != null && count($counters) > 0) {
					
					$counterArray = array ();
					

					foreach ($counters as $counterRow){

						$type = $counterRow['field_type'];
						$value = 0+$counterRow['counter_value'];
						
						if (strpos($type,'COUNT_ENTRY') !== false) {
							$this->counterValuesArray['COUNT_ENTRY'] = $value;
						}
						
						if (strpos($type,'COUNT_MEANING') !== false) {
							$this->counterValuesArray['COUNT_MEANING'] = $value;
						}
						
						if (strpos($type,'COUNT_PARTOFSPEECH') !== false) {
							$this->counterValuesArray['COUNT_PARTOFSPEECH'] = $value;
						}
						
						if (strpos($type,'COUNT_EXAMPLE') !== false) {
							$this->counterValuesArray['COUNT_EXAMPLE'] = $value;
						}					
					}
					// add the values for this day to the array of activities
					$entryActivitiesArray[] = $this->counterValuesArray['COUNT_ENTRY'];
					$definitionActivitiesArray[] = $this->counterValuesArray['COUNT_MEANING'];
					$partOfSpeechActivitiesArray[] = $this->counterValuesArray['COUNT_PARTOFSPEECH'];
					$exampleActivitiesArray[] = $this->counterValuesArray['COUNT_EXAMPLE'];
					$activityDateArray[] = $timestamp;
				}

				
					
 			}

		} else {
			LoggerFactory::getLogger()->logInfoMessage("no counter in range " .(date("d/m/Y H:i:s",$start)). " to ".(date("d/m/Y H:i:s",$end)));
		}

		LoggerFactory::getLogger()->logDebugMessage("activity count : ".count($entryActivitiesArray)." date count : ".count($activityDateArray));
		$result->setEntryActivities($entryActivitiesArray);
		$result->setDefinitionActivities($definitionActivitiesArray);
		$result->setExampleActivities($exampleActivitiesArray);
		$result->setPartOfSpeechActivities($partOfSpeechActivitiesArray);
		
		$result->setActivityDate($activityDateArray);
		return $result;
	}

	function processFile() {

// 		$doc = new \DOMDocument;
// 		$doc->preserveWhiteSpace = false;
// 		$doc->Load($this->_filePath);
// 		$xpath = new \DOMXPath($doc);

// 		$entries = $xpath->query("entry");
// 		$meaning = $xpath->query("entry/sense");
// 		$speech = $xpath->query("entry/sense/grammatical-info");
// 		$example = $xpath->query("entry/sense/example");

		
		// those value should take from Database.

		if (isset($this->_store)){
			$entriesListDto = $this->_store->getAllEntries();
			$entryCount = 0;
			$meaningCount = 0;
			$speechCount = 0;
			$exampleCount = 0;
			
			//Entry level
			foreach ($entriesListDto->_entries as $entry)
			{
				$entryCount= $entryCount + 1;
				
				//Sense Level
				foreach ($entry->_senses as $sense)
				{
					$meaningCount = $meaningCount + 1;
					
					if (trim($sense->_partOfSpeech)!=='')
					{
						$speechCount = + 1;
					}
					//Example Level
					foreach ($sense->_examples as $example)
					{
						$exampleCount = $exampleCount + 1;
					}
				}
			}
			
			$this->_wordCount = $entryCount;
			$this->_meaningCount = $meaningCount;
			$this->_posCount = $speechCount;
			$this->_exampleCount = $exampleCount;
		}

	}
}
?>