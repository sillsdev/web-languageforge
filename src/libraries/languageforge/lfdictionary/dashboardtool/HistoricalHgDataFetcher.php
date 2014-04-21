<?php
namespace libraries\lfdictionary\dashboardtool;

// TODO Delete. Currently used by UpdateDashboardCommand which should be changed to use HgWrapper directly. CP 2013-12
class HistoricalHgDataFetcher extends \libraries\lfdictionary\common\HgWrapper
{
	function __construct($repositoryPath) {		
		parent::__construct($repositoryPath);
	}
}