<?php
namespace libraries\lfdictionary\dto;

/**
 * ActivityDto
 * TODO Review. Compare with the SF ActivityDto they do a similar function.
 * REVIEWED CP 2013-12: This is mostly ok. It should be built from the mongo activity log, which in turn is build from the dashboardtool from the mercurial lex repo.
 */
class DashboardActivitiesDTO{

	/**
	 * @var Array<int>
	 */
	var $_entryActivities;

	/**
	 * @var Array<int>
	 */
	var $_exampleActivities;

	/**
	 * @var Array<int>
	 */
	var $_partOfSpeechActivities;

	/**
	 * @var Array<int>
	 */
	var $_definitionActivities;

	/**
	 * @var Array<int>
	 */
	var $_activityDate;


	/**
	 * @var int
	 */
	var $_statsWordCount;

	/**
	 * @var int
	 */
	var $_statsPOS;


	/**
	 * @var int
	 */
	var $_statsMeanings;

	/**
	 * @var int
	 */
	var $_statsExamples;

	function __construct(){
		$this->_entryActivities = array();
		$this->_exampleActivities = array();
		$this->_partOfSpeechActivities = array();
		$this->_definitionActivities = array();
		$this->_activityDate = array();
		$this->_statsWordCount=0;
		$this->_statsPOS=0;
		$this->_statsMeanings=0;
		$this->_statsExamples=0;
	}

	/**
	 * @param int $count
	 */
	function setStatsExamplesCount($count) {
		$this->_statsExamples = $count;
	}

	/**
	 * @param int $count
	 */
	function setStatsMeaningsCount($count) {
		$this->_statsMeanings = $count;
	}

	/**
	 * @param int $count
	 */
	function setStatsPOSCount($count) {
		$this->_statsPOS = $count;
	}

	/**
	 * @param int $count
	 */
	function setStatsWordCount($count) {
		$this->_statsWordCount = $count;
	}

	/**
	 * @param Array $activities
	 */
	function setEntryActivities($activities) {
		$this->_entryActivities = $activities;
	}

	/**
	* @param Array $activities
	*/
	function setExampleActivities($activities) {
		$this->_exampleActivities = $activities;
	}
	
	/**
	* @param Array $activities
	*/
	function setPartOfSpeechActivities($activities) {
		$this->_partOfSpeechActivities = $activities;
	}
	
	/**
	* @param Array $activities
	*/
	function setDefinitionActivities($activities) {
		$this->_definitionActivities = $activities;
	}
	/**
	 * @param Array $activities
	 */
	function setActivityDate($activityDate) {
		$this->_activityDate = $activityDate;
	}


	function encode(){
		return array("entryActivities" => $this->_entryActivities,
					 "exampleActivities" => $this->_exampleActivities,
					 "partOfSpeechActivities" => $this->_partOfSpeechActivities,
					 "definitionActivities" => $this->_definitionActivities,
					 "activityDate" => $this->_activityDate,
					 "statsWordCount" => $this->_statsWordCount,
					 "statsPos" => $this->_statsPOS,
					 "statsMeanings" => $this->_statsMeanings,
					 "statsExamples" => $this->_statsExamples);
	}

}