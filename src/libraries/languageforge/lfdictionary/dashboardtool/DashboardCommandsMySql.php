<?php
namespace libraries\lfdictionary\dashboardtool;
require_once(dirname(__FILE__) . '/../Config.php');

use \libraries\lfdictionary\common\DataConnector;
use \libraries\lfdictionary\common\DataConnection;
use \libraries\lfdictionary\common\LoggerFactory;
class DashboardCommandsMySql implements IDashboardCommands
{
	
	private $_entries;
	private $_meaning;
	private $_example;
	private $_speech;

	private $liftFilePath;

	/**
	 * @var DataConnection
	 */
	private $_dbActivity;

	public  function __construct() {
		$this->_dbActivity = DataConnector::connect();
		
		//echo "filePath".$filePath[0];

	}

	public function insertUpdateCounter($projectId, $field_type, $count, $timestamp, $hg_version, $hg_hash) {

		$counter = $this->getCounterByHashAndFieldType($projectId, $hg_hash, $field_type);

		if (count($counter) > 0) {
			return $this->updateCounter($projectId, $field_type, $count, $timestamp, $hg_version, $hg_hash);
		} else {
			$sql = "INSERT INTO lf_activity (`id`, `projectID`,`field_type`, `counter_value`, `time_stamp`, `hg_version`, `hg_hash`) VALUES (NULL, ".$projectId.", '".$field_type."', ".$count.", FROM_UNIXTIME($timestamp), $hg_version, '$hg_hash');";
			$result = $this->_dbActivity->execute($sql);
			if ($result!==FALSE)
			{
				return true;
			}
			return false;
		}

	}

	public function updateCounter($projectId, $field_type, $count, $timestamp, $hg_version, $hg_hash) {
		$sql = "UPDATE lf_activity SET
		 counter_value = $count
		 , hg_version = $hg_version	
		 , time_stamp = FROM_UNIXTIME($timestamp)
		 WHERE projectID = $projectId		
		 AND field_type ='$field_type'		
		 AND hg_hash = '$hg_hash';";
		//echo ($sql);
		$query = $this->_dbActivity->execute($sql);
		return $query;
	}


	public function getCountersByTimeStamp($projectId, $timestamp){
		$sql = "SELECT * FROM lf_activity WHERE projectID = ".$projectId." AND time_stamp = '".$timestamp."'";
		//echo ($sql);
		$query = $this->_dbActivity->execute($sql);

		return $this->fetchArray($query);
	}

	public function getCounterByHashAndFieldType($projectId, $hg_hash, $field_type){

		$sql = "SELECT * FROM lf_activity WHERE projectID = ".$projectId."
		AND hg_hash = '$hg_hash'
		AND field_type ='$field_type'";
		//echo ($sql);
		$query = $this->_dbActivity->execute($sql);
		return $this->fetchArray($query);
	}

	public function  getTimeStampsByDateRange($projectId, $start, $end){
		$sql = "SELECT time_stamp FROM lf_activity WHERE projectID = ".$projectId." AND time_stamp >=FROM_UNIXTIME(".$start.") AND time_stamp <= FROM_UNIXTIME(".$end.") GROUP BY time_stamp ORDER BY hg_version ASC";
		LoggerFactory::getLogger()->logDebugMessage($sql);
		//echo ($sql);
		$query = $this->_dbActivity->execute($sql);
		return $this->fetchArray($query);
	}

	public function  getAllTimeStamps($projectId){
		$sql = "SELECT time_stamp FROM lf_activity WHERE projectID = ".$projectId." GROUP BY time_stamp ORDER BY hg_version ASC";
		LoggerFactory::getLogger()->logDebugMessage($sql);
		//echo ($sql);
		$query = $this->_dbActivity->execute($sql);
		//echo "count ".$this->_dbActivity->numrows($query);
		return $this->fetchArray($query);
	}

	/**
	 * get last reversion saved in DB
	 * @param int $projectId
	 */
	public function  getLastReversionEntry($projectId){
		$sql = "SELECT * FROM lf_activity WHERE projectID = ".$projectId." GROUP BY time_stamp ORDER BY hg_version DESC LIMIT 1";
		$query = $this->_dbActivity->execute($sql);
		return $this->fetchArray($query);
	}

	/**
	 * get last reversion saved in DB
	 * @param int $projectId
	 */
	public function  getReversionNumberByHash($projectId, $hash){
		$sql = "SELECT hg_version FROM lf_activity WHERE projectID = ".$projectId." AND hg_hash = '" . $hash . "' LIMIT 1";
		$query = $this->_dbActivity->execute($sql);
		return $this->fetchArray($query);
	}

	public function fetchArray($query) {
		$result = array();

		while($row=mysqli_fetch_array($query)) {
			$result[] = $row;
		}
		//echo var_dump($result);
		return $result;
	}

}
?>