<?php
namespace libraries\lfdictionary\dashboardtool;

use models\mapper\MongoStore;
use models\mapper\ReferenceList;
class DashboardToolMongoListModel extends \models\mapper\MapperListModel
{
	
	public function __construct()
	{
		parent::__construct(
		DashboardToolMongoMapper::instance(),
		array()
		);
	}
	
	public function getDashboardActivitiesList($projectId, $hg_hash, $field_type) {
		return $this->readByQuery(array("project_id" => $projectId,
											"hg_hash" => $hg_hash,
											"field_type" => $field_type));
	}
	
	
	public function getDashboardActivitiesListByTimeStamp($projectId, $timestamp) {
		return $this->readByQuery(array("project_id" => $projectId,
											"time_stamp" => $timestamp));
	}
	
	public function getDashboardActivitiesListStartEnd($projectId, $start, $end) {
		return $this->readByQuery(array("project_id" => $projectId,
											"time_stamp" => array('$gte'=> $start, '$lte'=>$end)),
		array("time_stamp", "hg_version"),
		array("hg_version" => 1),1);
	}
	
	public function getDashboardActivitiesListAll($projectId) {
		return $this->readByQuery(array("project_id" => $projectId),
		array("time_stamp","field_type"),
		array("hg_version" => 1));
	}
	
	public function getDashboardActivitiesListLast($projectId) {
		return $this->readByQuery(array("project_id" => $projectId),
		array(), array("hg_version" => -1), 1);
	}
	
	public function getDashboardActivitiesListByHash($projectId, $hash) {
		return $this->readByQuery(array("project_id" => $projectId, "hg_hash" => $hash),
		array("hg_version"), array(), 1);
	}
}


?>