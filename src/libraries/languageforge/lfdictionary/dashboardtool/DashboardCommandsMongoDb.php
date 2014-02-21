<?php
namespace libraries\lfdictionary\dashboardtool;


use libraries\lfdictionary\dto\DashboardActivitiesDTO;

require_once(dirname(__FILE__) . '/../Config.php');
use \libraries\lfdictionary\common\LoggerFactory;
class DashboardCommandsMongoDb implements IDashboardCommands
{

	private $_entries;
	private $_meaning;
	private $_example;
	private $_speech;

	private $liftFilePath;

	public  function __construct() {

	}

	public function insertUpdateCounter($projectId, $field_type, $count, $timestamp, $hg_version, $hg_hash) {

		$counter = $this->getCounterByHashAndFieldType($projectId, $hg_hash, $field_type);
		if (count($counter) > 0) {
			echo "U ";
			return $this->updateCounter($projectId, $field_type, $count, $timestamp, $hg_version, $hg_hash);
		} else {
			echo "I ";
		//	$sql = "INSERT INTO lf_activity (`id`, `projectID`,`field_type`, `counter_value`, `time_stamp`, `hg_version`, `hg_hash`) 
		//	VALUES (NULL, ".$projectId.", '".$field_type."', ".$count.", FROM_UNIXTIME($timestamp), $hg_version, '$hg_hash');";
			$newActityModel = new DashboardToolMongoModel();
			$newActityModel->project_id = $projectId;
			$newActityModel->counter_value = $count;
			$newActityModel->field_type = $field_type;
			$newActityModel->hg_hash = $hg_hash;
			$newActityModel->hg_version = intval($hg_version);
			$newActityModel->time_stamp = $timestamp;
			return $newActityModel->write();
		}

	}

	public function updateCounter($projectId, $field_type, $count, $timestamp, $hg_version, $hg_hash) {
		$dashboardActivitiesList = new DashboardToolMongoListModel();
		
		$dashboardActivitiesList->getDashboardActivitiesList($projectId, $hg_hash, $field_type);
		
		foreach ($dashboardActivitiesList->entries as $value)
		{
			$dashboardActivitiesModel = new DashboardToolMongoModel($value["id"]);
			$dashboardActivitiesModel->read();
			$dashboardActivitiesModel->project_id = $projectId;
			$dashboardActivitiesModel->counter_value = $count;
			$dashboardActivitiesModel->field_type = $field_type;
			$dashboardActivitiesModel->hg_hash = $hg_hash;
			$dashboardActivitiesModel->hg_version = intval($hg_version);
			$dashboardActivitiesModel->time_stamp = $timestamp;
			$dashboardActivitiesModel->write();
		}
	}


	public function getCountersByTimeStamp($projectId, $timestamp){
		//$sql = "SELECT * FROM lf_activity WHERE projectID = ".$projectId." AND time_stamp = '".$timestamp."'";
		$dashboardActivitiesList = new DashboardToolMongoListModel();
		$dashboardActivitiesList->getDashboardActivitiesListByTimeStamp($projectId, $timestamp);
		return $dashboardActivitiesList->entries;
	}

	public function getCounterByHashAndFieldType($projectId, $hg_hash, $field_type){

		//$sql = "SELECT * FROM lf_activity WHERE projectID = ".$projectId." AND hg_hash = '$hg_hash' AND field_type ='$field_type'";
		$dashboardActivitiesList = new DashboardToolMongoListModel();
		$dashboardActivitiesList->getDashboardActivitiesList($projectId, $hg_hash, $field_type);
		return $dashboardActivitiesList->entries;
	}

	public function  getTimeStampsByDateRange($projectId, $start, $end){
		//$sql = "SELECT time_stamp FROM lf_activity WHERE projectID = ".$projectId." AND time_stamp >=FROM_UNIXTIME(".$start.") AND time_stamp <= FROM_UNIXTIME(".$end.") GROUP BY time_stamp ORDER BY hg_version ASC";
		$dashboardActivitiesList = new DashboardToolMongoListModel();
		$dashboardActivitiesList->getDashboardActivitiesListStartEnd($projectId, $start, $end);
		$result = array();
		foreach ($dashboardActivitiesList->entries as $data) {
			$key = $data['time_stamp'];
			if (isset($result[$key])) {
				$result[$key][] = $data;
			} else {
				$result[$key] = array($data);
			}
		}
		return $result;
	}

	public function  getAllTimeStamps($projectId){
		//$sql = "SELECT time_stamp FROM lf_activity WHERE projectID = ".$projectId." GROUP BY time_stamp ORDER BY hg_version ASC";
		$dashboardActivitiesList = new DashboardToolMongoListModel();
		$dashboardActivitiesList->getDashboardActivitiesListAll($projectId);
		
		$result = array();
		foreach ($dashboardActivitiesList->entries as $data) {
			$key = $data['time_stamp'];
			if (isset($result[$key])) {
				$result[$key][] = $data;
			} else {
				$result[$key] = array($data);
			}
		}
		return $result;
	}

	/**
	 * get last reversion saved in DB
	 * @param int $projectId
	 */
	public function  getLastReversionEntry($projectId){
		//$sql = "SELECT * FROM lf_activity WHERE projectID = ".$projectId." GROUP BY time_stamp ORDER BY hg_version DESC LIMIT 1";

		$dashboardActivitiesList = new DashboardToolMongoListModel();
		$dashboardActivitiesList->getDashboardActivitiesListLast($projectId);

		return $dashboardActivitiesList->entries;
	}

	/**
	 * get last reversion saved in DB
	 * @param int $projectId
	 */
	public function  getReversionNumberByHash($projectId, $hash){
		//$sql = "SELECT hg_version FROM lf_activity WHERE projectID = ".$projectId." AND hg_hash = '" . $hash . "' LIMIT 1";
		$dashboardActivitiesList = new DashboardToolMongoListModel();
		$dashboardActivitiesList->getDashboardActivitiesListByHash($projectId, $hash);

		return $dashboardActivitiesList->entries;
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