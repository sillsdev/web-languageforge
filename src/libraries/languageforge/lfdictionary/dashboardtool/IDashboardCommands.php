<?php
namespace libraries\lfdictionary\dashboardtool;
interface IDashboardCommands
{

	/**
	 * 
	 * Enter description here ...
	 * @param int $projectId
	 * @param String $field_type
	 * @param int $count
	 * @param int $timestamp
	 * @param int $hg_version
	 * @param String $hg_hash
	 * @return Booelan
	 */
	public function insertUpdateCounter($projectId, $field_type, $count, $timestamp, $hg_version, $hg_hash);
	
	/**
	 * 
	 * Enter description here ...
	 * @param int $projectId
	 * @param int $timestamp
	 * @return int
	 */
	public function getCountersByTimeStamp($projectId, $timestamp);
	
	/**
	 * 
	 * Enter description here ...
	 * @param int $projectId
	 * @param int $start
	 * @param int $end
	 * @return mixed
	 */
	public function getTimeStampsByDateRange($projectId, $start, $end);
	
	/**
	 * 
	 * Enter description here ...
	 * @param int $projectId
	 * @return mixed
	 */
	public function getAllTimeStamps($projectId);
	
	/**
	 * 
	 * Enter description here ...
	 * @param int $projectId
	 * @param String $hash
	 * @return int
	 */
	public function getReversionNumberByHash($projectId, $hash);
	
	/**
	 * 
	 * Enter description here ...
	 * @param int $projectId
	 * @return mixed
	 */
	public function getLastReversionEntry($projectId);
	
}
?>