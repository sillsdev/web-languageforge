<?php
class LexProjectMockObject {

	const SETTINGS_EXTENSION = '.WeSayConfig';
	const DEFAULT_SETTINGS_FILE = 'default.WeSayConfig';
	const WRITING_SYSTEMS_DIR = '/WritingSystems/';
	const SETTINGS_DIR = '/LanguageForgeSettings/';
	const DEFAULT_SETTINGS_FILE_LEX = 'WeSayConfig.Lex.Default';
	
	// these constants may fit better in a different class
	const DEFAULT_SETTINGS_FILE_RWC = 'WeSayConfig.Rwc.Default'; // TODO Move this to the LFRapidWords project CP 2012-09
	const LEXICON_WORD_PACK_FILE_NAME = 'SILCawl.lift';
	const LEXICON_WORD_LIST_SOURCE = '/var/lib/languageforge/lexicon/wordpacks/';
	const TEMPLATE_DIR = 'lfdictionary/data/template/';
	/**
	 * @var StoreLiftTestEnvironment
	 */
	private $_liftEnvironment;

	/**
	 * @param StoreLiftTestEnvironment $liftEnvironment
	 */
	function __construct($liftEnvironment = null) {
		$this->_liftEnvironment = $liftEnvironment;
	}

	function getCurrentHash() {
		if ($this->_liftEnvironment) {
			return $this->_liftEnvironment->getCurrentHash();
		}
		return ''; // Will match the mongo default so no update will occur
	}

	function getLiftFilePath() {
		return $this->_liftEnvironment->getLiftFilePath();
	}
	
	function writingSystemsFolderPath() {
		return TEST_PATH.self::TEMPLATE_DIR.self::WRITING_SYSTEMS_DIR;
	}
	
	public function getUserSettingsFilePath($userName) {
		return $this->getLanguageForgeSetting().$userName.self::SETTINGS_EXTENSION;
	}
	
	public function getLanguageForgeSetting() {
		return TEST_PATH.self::TEMPLATE_DIR.self::SETTINGS_DIR;
	}
	
}
?>