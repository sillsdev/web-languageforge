<?php
use libraries\lfdictionary\dashboardtool\DashboardToolFactory;
use libraries\lfdictionary\dashboardtool\DashboardDbType;
use libraries\lfdictionary\dashboardtool\ActivityFieldType;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");


class DashboardToolDbAccess_Test extends UnitTestCase {
	
	function testInsertCounters() {
		$DashboardToolDbAccess = DashboardToolFactory::getDashboardDbAccess(DashboardDbType::DB_MYSQL);
		$projectNodeId = 284;
		
		$entries = 2;
		$meaning = 4;
		$speech = 6;
		$example = 8;
		
		$timestamp = mktime(0, 0, 0, date("m"), date("d"), date("y"));
		
		$hg_version = 20;
		$hg_hash = "123456";
		
		$DashboardToolDbAccess->insertUpdateCounter($projectNodeId, ActivityFieldType::COUNT_ENTRY, $entries, $timestamp, $hg_version, $hg_hash);
		$DashboardToolDbAccess->insertUpdateCounter($projectNodeId, ActivityFieldType::COUNT_MEANING, $meaning, $timestamp, $hg_version, $hg_hash);
		$DashboardToolDbAccess->insertUpdateCounter($projectNodeId, ActivityFieldType::COUNT_PARTOFSPEECH, $speech, $timestamp, $hg_version, $hg_hash);
		$DashboardToolDbAccess->insertUpdateCounter($projectNodeId, ActivityFieldType::COUNT_EXAMPLE, $example, $timestamp, $hg_version, $hg_hash);
		
		$counters = $DashboardToolDbAccess->getCountersByTimeStamp($projectNodeId, date("Y-m-d H:i:s",($timestamp)));
		$this->assertEqual(4, count($counters));
		
		foreach ($counters as $counter ) {
			$type = $counter['field_type'];
			$value = 0+$counter['counter_value'];
			
			if (strpos($type,'COUNT_ENTRY') !== false) {
				$this->assertEqual($entries, $value);
			}
			
			if (strpos($type,'COUNT_MEANING') !== false) {
				$this->assertEqual($meaning, $value);
			}
			
			if (strpos($type,'COUNT_PARTOFSPEECH') !== false) {
				$this->assertEqual($speech, $value);
			}
			
			if (strpos($type,'COUNT_EXAMPLE') !== false) {
				$this->assertEqual($example, $value);
			}

			$DashboardToolDbAccess->updateCounter($projectNodeId, $type, $value+2, $timestamp, $hg_version, $hg_hash);
		}
		
		$countersAfterUpdate = $DashboardToolDbAccess->getCountersByTimeStamp($projectNodeId, date("Y-m-d H:i:s",($timestamp)));
		$this->assertEqual(4, count($countersAfterUpdate));
		
		foreach ($countersAfterUpdate as $counterAfterUpdate ) {
		
			$type = $counterAfterUpdate['field_type'];
			$value = 0+$counterAfterUpdate['counter_value'];
				
			if (strpos($type,'COUNT_ENTRY') !== false) {
				$this->assertEqual($entries +2, $value);
			}
				
			if (strpos($type,'COUNT_MEANING') !== false) {
				$this->assertEqual($meaning +2, $value);
			}
				
			if (strpos($type,'COUNT_PARTOFSPEECH') !== false) {
				$this->assertEqual($speech +2, $value);
			}
				
			if (strpos($type,'COUNT_EXAMPLE') !== false) {
				$this->assertEqual($example +2, $value);
			}		
		}
	}
}
?>