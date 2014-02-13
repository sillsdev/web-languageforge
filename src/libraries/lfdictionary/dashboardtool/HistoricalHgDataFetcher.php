<?php
namespace libraries\lfdictionary\dashboardtool;
class HistoricalHgDataFetcher extends \libraries\lfdictionary\common\HgWrapper
{
	function __construct($repositoryPath) {		
		parent::__construct($repositoryPath);
	}
}