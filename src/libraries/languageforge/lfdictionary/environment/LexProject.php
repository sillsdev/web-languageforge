<?php
namespace libraries\lfdictionary\environment;

use libraries\palaso\CodeGuard;

use libraries\lfdictionary\common\LoggerFactory;
use models\ProjectModel;
use libraries\lfdictionary\environment\ProjectState;

class LexProject
{
	// the follow constants seem to fit well in this class
	const SETTINGS_EXTENSION = '.WeSayConfig';
	const DEFAULT_SETTINGS_FILE = 'default.WeSayConfig';
	const WRITING_SYSTEMS_DIR = '/WritingSystems/';
	const SETTINGS_DIR = '/LanguageForgeSettings/';
	const DEFAULT_SETTINGS_FILE_LEX = 'WeSayConfig.Lex.Default';
	
	// these constants may fit better in a different class	
	const DEFAULT_SETTINGS_FILE_RWC = 'WeSayConfig.Rwc.Default'; // TODO Move this to the LFRapidWords project CP 2012-09
	const LEXICON_WORD_PACK_FILE_NAME = 'SILCawl.lift';
	const LEXICON_WORD_LIST_SOURCE = '/var/lib/languageforge/lexicon/wordpacks/';

	
	/**
	 * @var ProjectModel
	 */
	public $projectModel;
	
	/**
	 * @var string
	 */
	public $projectPath;
	
	/**
	 * 
	 * @var string
	 */
	public $workFolderPath;
	
	/**
	 * @var ProjectState
	 */
	public $projectState;

	/**
	 * @var string
	 */
	private $_liftFilePath;
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param string $projectBasePath
	 */
	public function __construct($projectModel, $workPath = '') {
		if (empty($workPath)) {
			$workPath = self::defaultWorkFolderPath();
		}
		$this->projectModel = $projectModel;
		
		$projectName = $this->projectModel->projectSlug;
		$workPath = rtrim($workPath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
		$this->workFolderPath = $workPath;
		$this->projectPath = rtrim($workPath . $projectName, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
		$this->projectState = new ProjectState($projectName);
		// If not ready, check for existence and mark ready if we can. This copes with Legacy project created before ProjectState
		if ($this->projectState->getState() == '') {
			if (file_exists($this->projectPath)) {
				$this->projectState->setState(ProjectStates::Ready);
			}
		}
	}
	
	/**
	 * Creates a new Lexicon project
	 * @throws \Exception
	 */
	public function create() {
		if (is_dir($this->projectPath)) {
			throw new \Exception(sprintf("Cannot create new project '%s' already exists", $this->projectPath));
		}
		LexProjectFixer::fixProjectVLatest($this, false);
		$this->projectState->setState(\libraries\lfdictionary\environment\ProjectStates::Ready);
	}
	
	public function getUserOrDefaultProjectSettingsFilePath($userName) {
		$configFilePath = $this->getUserSettingsFilePath($userName);
		if (!file_exists($configFilePath)) {
			$configFilePath = $this->projectDefaultSettingsFilePath();
			if (!file_exists($configFilePath)) {
				LexProjectFixer::fixProjectVLatest($this);
			}
		}
		return $configFilePath;
	}
	
	/**
	 * Returns the full path to the user (dictionary) settings file.
	 * @param string $userName
	 * @return string
	 * 		Example: /var/lib/languageforge/work/<some project>/LanguageForge/<username>.WeSayConfig
	 */
	 public function getUserSettingsFilePath($userName) {
	 	$configFile = $this->projectPath . self::SETTINGS_DIR . $userName . self::SETTINGS_EXTENSION;
		return $configFile;
	}
	
	/**
	 * @param string $userName
	 * @return string - the user settings file path
	 */
	public function ensureUserSettingsFileExists($userName) {
		$userSettingsFilePath = $this->projectSettingsFolderPath() . $userName . self::SETTINGS_EXTENSION;
		if (file_exists($userSettingsFilePath)) {
			return $userSettingsFilePath;
		}
	
		// try to get it from the project folder projectname.WeSayConfig
		$weSayProjectConfig = $this->projectPath . $this->projectModel->projectSlug . self::SETTINGS_EXTENSION;
		if (file_exists($weSayProjectConfig)) {
			copy($weSayProjectConfig, $userSettingsFilePath);
			return $userSettingsFilePath;
		}
	
		// fall back to languageforgesettings/default.WeSayConfig
		$this->ensureWeSayConfigExists();
		copy($this->projectDefaultSettingsFilePath(), $userSettingsFilePath);
		return $userSettingsFilePath;
	}
	
	/**
	 * Returns the full path to the project default settings file.
	 * @return string
	 * 		Example: /var/lib/languageforge/work/<some project>/LanguageForge/default.WeSayConfig
	 */
	public function projectDefaultSettingsFilePath() {
		return $this->projectPath . self::SETTINGS_DIR . self::DEFAULT_SETTINGS_FILE;
	}
	
	public function projectSettingsFolderPath() {
		return $this->projectPath . self::SETTINGS_DIR;
	}
	
	public function writingSystemsFolderPath() {
		return $this->projectPath . self::WRITING_SYSTEMS_DIR;
	}
	
	static public function defaultWorkFolderPath() {
		return LANGUAGEFORGE_VAR_PATH . "work/";
	}
	
	static public function stateFolderPath() {
		return LANGUAGEFORGE_VAR_PATH . 'state/';
	}
	
	/**
	 * Returns the path to the template folder
	 * @return string
	 * 		Example: /var/lib/languageforge/lexicon/template/
	 */
	static public function templatePath() {
		return LANGUAGEFORGE_VAR_PATH . "lexicon/template/";
	}
	
	/**
	 * Returns the path to the resources folder.
	 * The resources folder contains resources such as the SemanticDomain files
	 * @return string
	 * 		Example: /var/lib/languageforge/lexicon/resources/
	 */
	static public function resourcePath() {
		return LANGUAGEFORGE_VAR_PATH . "lexicon/resources/";
	}
	
	
	/**
	 * Locates and returns the full path to the *.WeSayConfig file to use for this user / project.
	 * A .WeSayConfig file is created if needs be.
	 * @return string
	 * @throws \Exception
	 */
	static public function locateSemanticDomainFilePath($languageCode) {
		$filePath = self::resourcePath() . 'SemanticDomains/Ddp4-' . $languageCode . '.xml';
		if (!file_exists($filePath)) {
			$filePathEnglish = self::resourcePath() . 'SemanticDomains/Ddp4-en.xml';
			if (!file_exists($filePathEnglish)) {
				throw new \Exception(sprintf("Semantic Domains: Resource file not found '%s'", $filePathEnglish));
			}
			LoggerFactory::getLogger()->logInfoMessage(sprintf("Semantic Domains: Resource not found '%s' using english", $filePath));
			$filePath = $filePathEnglish;
		}
		return $filePath;
	}
	
	public function getCurrentHash() {
		$hg = new \libraries\lfdictionary\common\HgWrapper($this->projectPath);
		try {
			$currentHash = $hg->getCurrentHash();
		} catch (\Exception $exception) {
			$currentHash = 'unknown';
			LoggerFactory::getLogger()->logInfoMessage(sprintf("WARNING: getCurrentHash failed for '%s'", $this->projectModel->projectSlug));
		}
		return $currentHash;
	}

	public function getChorusNotesFilePath() {
		$liftFilePath = $this->getLiftFilePath();
		return $liftFilePath . '.ChorusNotes';
	}
	
	protected function locateLiftFilePath() {
		if ($this->_liftFilePath) {
			return $this->_liftFilePath;
		}
		
		$filePaths = glob($this->projectPath . '*.lift');

		$c = count($filePaths);
		if ($c == 0) {
			return null;
		}
		
		//try a lift file almost matching <projectName>.lift in the first instance
		$prePercent = 0;
		$bestMatchName = "";
		foreach ($filePaths as $filePath) {			
			similar_text(basename($filePath, ".lift"), $this->projectModel->projectSlug, $percent);
			if ($prePercent <= $percent)
			{
				$prePercent = $percent;
				$bestMatchName = $filePath;
			}
		}
		if ($bestMatchName==="")
		{
			$this->_liftFilePath = $filePaths[0];
		}else
		{
			$this->_liftFilePath = $bestMatchName;
		}
		if ($c > 1) {
			LoggerFactory::getLogger()->logInfoMessage(sprintf("%d lift files found in '%s' using '%s'", $c, $this->projectPath, $this->_liftFilePath));
		}

		return $this->_liftFilePath;
	}
	
	public function getLiftFilePath() {
		$this->isReadyOrThrow();
		$liftFilePath = $this->locateLiftFilePath();
		if ($liftFilePath == null) {
			LexProjectFixer::fixProjectVLatest($this);
			return $this->getLiftFilePath();
		}
		return $liftFilePath;
	}
	
	/**
	 * @return bool
	 */
	public function isReady() {
		$state =  $this->projectState->getState();
		if ($state != \libraries\lfdictionary\environment\ProjectStates::Ready) {
			return false;
		}
		return true;
	}
	
	/**
	 * @return bool
	 */
	public function isReadyOrThrow() {
		$result = $this->isReady();
		if (!$result) {
			throw new \Exception(sprintf(
					"The project '%s' (%s) is not yet ready for use.",
					$this->projectModel->projectName, $this->projectModel->projectSlug
			));
		}
		return $result;
	}
}


?>
