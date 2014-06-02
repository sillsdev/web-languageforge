<?php
namespace libraries\lfdictionary\environment;

use libraries\lfdictionary\common\LoggerFactory;
use libraries\lfdictionary\common\HgWrapper;
use libraries\palaso\CodeGuard;
use models\ProjectModel;

class LexProjectFixer extends LexProject
{
	
	/**
	 * 
	 * @var bool
	 */
	private $_shouldLog;
	
	
	/**
	 * @param string $projectName
	 * @param ProjectModel $projectModel
	 * @param bool $logMessages
	 */
	function __construct($projectModel, $logMessages = true, $projectBasePath = '') {
		CodeGuard::checkTypeAndThrow($projectModel, 'models\ProjectModel');
		parent::__construct($projectModel, $projectBasePath);
		$this->_shouldLog = $logMessages;
	}
	
	private function fixProjectV01() {
		if (!$this->checkTemplatesExist()) {
			$message = "LexProject templates do not exist on this system. Check that " . $this->templatePath() . " exists and all files are present";
			LoggerFactory::getLogger()->logInfoMessage($message);
			throw new \Exception($message);
		}
		$this->ensureWorkFolderExists();
		$this->ensureStateFolderExists();
		$this->ensureProjectFolderExists();
		$this->ensureSettingsFolderExists();
		$this->ensureLiftFileExists();
		$this->ensureWeSayConfigExists();
		$this->ensureWritingSystemsExists();
		$this->ensureIsHgRepository();
	}
	
	/**
	 * @param LexProject $lexProject
	 */
	public static function fixProjectVLatest($lexProject, $logMessages = true) {
		$fixer = new LexProjectFixer($lexProject->projectModel, $logMessages, $lexProject->workFolderPath);
		$fixer->fixProjectV01();
	}
	
	private function ensureSettingsFolderExists() {
		$this->ensureProjectFolderExists();
		$settingsPath = $this->projectPath . self::SETTINGS_DIR;
		if (!file_exists($settingsPath)) {
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("settings path does not exist.  fixed %s",$settingsPath));
			}
			mkdir($settingsPath);
		}
	}
	
	private function ensureWorkFolderExists() {
		if (!file_exists($this->workFolderPath)) {
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("project path does not exist.  fixed %s",$this->projectPath));
			}
			mkdir($this->workFolderPath);
		}
	}
	
	private function ensureProjectFolderExists() {
		$this->ensureWorkFolderExists();
		$projectPath = $this->projectPath;
		if (!file_exists($projectPath)) {
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("project path does not exist.  fixed %s",$this->projectPath));
			}
			mkdir($projectPath);
		}
	}
	
	private function ensureLiftFileExists() {
		$this->ensureProjectFolderExists();
		$projectPath = $this->projectPath;
		if ($this->locateLiftFilePath() == null) {
			$templatePath = self::templatePath();
			$sourceFile = $templatePath . "default.lift";
			$liftFile = $this->projectPath . $this->projectModel->projectSlug . ".lift";
			copy($sourceFile, $liftFile);
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("lift file does not exist.  fixed %s",$liftFile));
			}
		}
	}
		
	private function ensureWritingSystemsExists() {
		$this->ensureProjectFolderExists();
		$writingSystemsFolder = $this->projectPath . "WritingSystems";
		$templatePath = self::templatePath();
		if (!file_exists($writingSystemsFolder)) {
			$this->fileCopy($templatePath . "WritingSystems", $writingSystemsFolder);
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("writing system files do not exist.  fixed %s",$writingSystemsFolder));
			}
			$languageCode = $this->projectModel->languageCode;
			$ldmlFile = $writingSystemsFolder . "/$languageCode.ldml";
			rename($writingSystemsFolder . "/qaa.ldml", $ldmlFile);
			$this->findReplace($ldmlFile, "qaa", $languageCode);
		}
	}
	
	private function ensureStateFolderExists() {
		if (!file_exists($this->stateFolderPath())) {
			mkdir($this->stateFolderPath());
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("state folder does not exist.  fixed %s",$this->stateFolderPath()));
			}
		}
	}
	
	private function ensureWeSayConfigExists() {
		$this->ensureSettingsFolderExists();
		$configFilePath = $this->projectDefaultSettingsFilePath();
		if (!file_exists($configFilePath)) {
			$srcFilePath = $this::templatePath() . self::SETTINGS_DIR . 'default.WeSayConfig';
			// This check should be unnecessary, but seems necessary for now CP 2013-08
			if (!file_exists($srcFilePath)) {
				throw new \Exception("Expected template file '$srcFilePath' not found.");
			} 
			copy($srcFilePath, $configFilePath);
			$this->findReplace($configFilePath, "qaa", $this->projectModel->languageCode);
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("wesay config file does not exist.  fixed %s",$configFilePath));
			}
		}
	}
	
	private function ensureIsHgRepository() {
		if (!file_exists($this->projectPath . ".hg")) {
			if ($this->_shouldLog) {
				LoggerFactory::getLogger()->logInfoMessage(sprintf("project path is not an hg repository.  fixed %s",$this->projectPath));
			}
			$hg = new HgWrapper($this->projectPath);
			$hg->init();
			$hg->addFile($this->projectPath);
			$hg->commit("initial project commit");
		}
	}
	
	static function checkTemplatesExist() {
		$templatePath = self::templatePath();
		if (!file_exists($templatePath)) {
			return false;
		}
		$templateFilePath = $templatePath . 'default.lift';
		if (!file_exists($templateFilePath)) {
			return false;
		}
		$templateFilePath = $templatePath . LANGUAGE_FORGE_SETTINGS . 'default.WeSayConfig';
		if (!file_exists($templateFilePath)) {
			return false;
		}
		$templateFilePath = $templatePath . 'WritingSystems';
		if (!file_exists($templateFilePath)) {
			return false;
		}
		$templateFilePath = $templatePath . 'WritingSystems/qaa.ldml';
		if (!file_exists($templateFilePath)) {
			return false;
		}
		$templateFilePath = $templatePath . 'WritingSystems/en.ldml';
		if (!file_exists($templateFilePath)) {
			return false;
		}
		$templateFilePath = $templatePath . 'WritingSystems/idchangelog.xml';
		if (!file_exists($templateFilePath)) {
			return false;
		}
		return true;
	}
	
	private function fileCopy($source, $target ) {
		if (is_dir($source)) {
			if (!is_dir($target)) {
				mkdir($target);
			}
			$d = dir($source);
			while (FALSE !== ($entry = $d->read())) {
				if ($entry == '.' || $entry == '..') {
					continue;
				}
				$entryFilePath = $source . '/' . $entry;
				if (is_dir($entryFilePath)) {
					$this->fileCopy($entryFilePath, $target . '/' . $entry);
					continue;
				}
				copy($entryFilePath, $target . '/' . $entry);
			}
			$d->close();
		} else {
			copy($source, $target);
		}
	}
	
	/**
	 * 
	 * @param string $filePath - text file in which to do the search/replace
	 * @param string $from - string to search for
	 * @param string $to - replacement string
	 */
	private function findReplace($filePath, $from, $to) {
		$content = file_get_contents($filePath);
		$newContent = str_replace($from, $to, $content);
		file_put_contents($filePath, $newContent);
	}
	
	
}