<?php

namespace libraries\lfdictionary\dashboardtool;
use models\mapper\MongoStore;
use models\mapper\ReferenceList;


class DashboardToolMongoMapper extends \models\mapper\MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new DashboardToolMongoMapper(LF_DATABASE, 'lf_activity');
		}
		return $instance;
	}
	
	public function drop($databaseName) {
		if (MongoStore::hasDB($databaseName)) {
			$db = MongoStore::connect($databaseName);
			$db->drop();
		}
	}
}

?>