<?php
namespace libraries\lfdictionary\commands;

use libraries\lfdictionary\common\HgWrapper;

require_once(dirname(__FILE__) . '/../Config.php');

use libraries\lfdictionary\common\AsyncRunner;
use libraries\lfdictionary\dashboardtool\DashboardToolFactory;
use libraries\lfdictionary\dashboardtool\DashboardDbType;
use libraries\lfdictionary\dashboardtool\HistoricalHgDataFetcher;
use libraries\lfdictionary\common\LoggerFactory;
use models\ProjectModel;

/**
 * UpdateDashboardCommand processes the Lift file in a Lex Repository updating the current statistics
 * stored in the mongo db.
 * @see HgWrapper
 * @see AsyncRunner
 * REVIEWED CP 2013-12: This is mostly ok, some minor refactoring.  The dashboard data needs a decent model with mongo persistence.
 * TODO Refactor. The HistoricalHgDataFetcher should really be just the HgWrapper. CP 2013-12
 */
class UpdateDashboardCommand
{
	
	// need to match with client: DashboardUpdateResultType.java
	const STANDBY=0;
	const RUNNING=1;
	const UPDATED=2;
	const NOCHANGE=3;

	/**
	 * @var int
	 */
	var $_result;

	/**
	 * @var int
	 */
	private $_projectNodeId;

	/**
	 * @var ProjectModel
	 */
	private $_projectModel;

	/**
	 * @var LexProject
	 */
	private $_lexProject;

	/**
	 * @param string $projectID
	 * @param ProjectModel $projectModel
	 * @param LexProject $lexProject
	 */
	function __construct($projectID, $projectModel,$lexProject) {
		$this->_projectModel=$projectModel;
		$this->_projectNodeId=$projectID;
		$this->_lexProject=$lexProject;
	}

	function execute() {
		// 1. get last version record in DB
		$asyncRunner = $this->createAsyncRunner();
		if ($asyncRunner->isRunning())
		{
			if ($asyncRunner->isComplete()) {
				$asyncRunner->cleanUp();
				// tell client update done!
				return UpdateDashboardCommand::UPDATED;
			}else
			{
				// do nothing, becasue last process still running
				return UpdateDashboardCommand::RUNNING;
			}
		}
		$projectRepoPath = $this->_lexProject->projectPath;
		$dashboardCommands = DashboardToolFactory::getDashboardCommands(DashboardDbType::DB_MONGODB);
		$historicalHgDataFetcher = new HistoricalHgDataFetcher($projectRepoPath);
		$asyncRunner =  $this->createAsyncRunner();
		$lastEntry = $dashboardCommands->getLastReversionEntry($this->_projectNodeId);
		$lastReversion="";
		$lastHash="";
		if ($lastEntry != null && count($lastEntry) == 1) {
			$entry=$lastEntry[0];
			$lastReversion=$entry['hg_version'];
			$lastHash=$entry['hg_hash'];
		}
		LoggerFactory::getLogger()->logDebugMessage("lastDBReversion: " . $lastReversion);
		LoggerFactory::getLogger()->logDebugMessage("lastDBHash: " . $lastHash);
		// 2. get last version from HG
		$hgNodeLogRevResult = $historicalHgDataFetcher->logNodeRev();
		if (count($hgNodeLogRevResult) < 1) {
			throw new \Exception("No hg repository found at ". $projectRepoPath);
		}
		$hgRevision = 0;
		$hgHash = "";
		foreach ($hgNodeLogRevResult as $value) {
			$hgNodeLogs = explode(";", $value);
			$hgRevision = $hgNodeLogs[0];
			$hgHash = $hgNodeLogs[1];
		}
		LoggerFactory::getLogger()->logDebugMessage("lastHgReversion: " . $hgRevision);
		LoggerFactory::getLogger()->logDebugMessage("lastHgHash: " . $hgHash);
		// 3. compare them
		if ($lastReversion!==$hgRevision || $lastHash!=$hgHash) {
			//something needs update
			if ($lastReversion==="") {
				//empty DB, full range process
				$this->processFile($asyncRunner,"1970-01-01", (date('Y') +10) . "-12-31");
				return UpdateDashboardCommand::RUNNING;
			} else {
				// becasue the log data are fetched from local, so no need to use AsyncRunner
				$hgLogNodeResult  = $historicalHgDataFetcher->logNode("1970-01-01", (date('Y') +10) . "-12-31");
				if (count($hgLogNodeResult ) == 0) {
					echo "no log received.", PHP_EOL;
				}
				$beginTime = "";
				foreach ($hgLogNodeResult  as $value) {
					$hgLogs = explode(";", $value);
					if (count($hgLogs)!=3)
					{
						continue;
					}
					$hgHash = $hgLogs[0];
					$hgdate = $hgLogs[1];
					$hgRevision = $hgLogs[2];
					$revisionNumberArray = $dashboardCommands->getReversionNumberByHash($this->_projectNodeId, $hgHash);
					if ($revisionNumberArray != null && count($revisionNumberArray) == 1) {
						$revisionNumber=$revisionNumberArray[0];
						$DbRevision=$revisionNumber['hg_version'];
						LoggerFactory::getLogger()->logDebugMessage("Try To Matching: (Local/DB) " . $hgRevision . " / " . $DbRevision);
						if ($DbRevision!=$hgRevision)
						{
							LoggerFactory::getLogger()->logDebugMessage("hgHash diff DB, need update");
							$beginTime =  date("Y", strtotime($hgdate))."-".date("m", strtotime($hgdate))."-".date("d", strtotime($hgdate));
						}
					} else {
						LoggerFactory::getLogger()->logDebugMessage("hgHash not in DB, need to add a new hgHash");
						$beginTime =  date("Y", strtotime($hgdate))."-".date("m", strtotime($hgdate))."-".date("d", strtotime($hgdate));
					}
				}
				LoggerFactory::getLogger()->logDebugMessage("Starting Date find at : " . $beginTime);
				$this->processFile($asyncRunner,$beginTime, (date('Y') +10) . "-12-31");
				return UpdateDashboardCommand::RUNNING;
			}


		}else
		{
			return UpdateDashboardCommand::NOCHANGE;
		}

		if ($asyncRunner->isRunning()) {
			// The lock file exists, so we may be still running, or complete.
			if ($asyncRunner->isComplete()) {
				$asyncRunner->cleanUp();
				return UpdateDashboardCommand::UPDATED;
			} else {
				return UpdateDashboardCommand::RUNNING;
			}
		}
		return UpdateDashboardCommand::RUNNING;
	}

	function processFile($asyncRunner, $begin, $end) {
		$run = "php ".SOURCE_PATH."dashboardtool/run.php --pid=$this->_projectNodeId --start=$begin --end=$end";
		$asyncRunner->run($run);
	}

	/**
	 * Returns an array of error strings.
	 * An empty array is returned if there are no errors.
	 * Will throw if not complete.
	 * @return string[]
	 */
	public function error() {
		$asyncRunner = $this->createAsyncRunner();
		$output = $asyncRunner->getOutput();
		$errors = \libraries\lfdictionary\common\HgWrapper::errorMessageFilter($output);
		return $errors;
	}

	/**
	 * @return bool
	 */
	public function isComplete() {
		$asyncRunner = $this->createAsyncRunner();
		return $asyncRunner->isComplete();
	}

	private function createAsyncRunner() {
		return new AsyncRunner($this->stateFilePath());
	}

	private function stateFilePath() {
		return $this->_lexProject->getLiftFilePath().".dashboard";
	}

};

?>