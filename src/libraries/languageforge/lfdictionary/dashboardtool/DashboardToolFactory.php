<?php
namespace libraries\lfdictionary\dashboardtool;

class DashboardDbType
{
	const DB_TEST  = 0;
	const DB_MYSQL = 1;
	const DB_MONGODB = 2;
}

class DashboardToolFactory
{
	public static function getDashboardCommands($dbType)
	{
		switch ($dbType) {
			case DashboardDbType::DB_MYSQL:
				return new DashboardCommandsMySql();
			case DashboardDbType::DB_MONGODB:
				return new DashboardCommandsMongoDb();
			case DashboardDbType::DB_TEST:
				throw new \Exception('Not implemented');
				break;
			default:
				throw new \Exception("undefined database type");
			break;
		}
	}
}

?>