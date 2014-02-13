<?php
namespace libraries\lfdictionary\commands;
use libraries\lfdictionary\environment\LexProjectFixer;

use libraries\lfdictionary\environment\LexProject;

use libraries\lfdictionary\mapper\InputSystemXmlJsonMapper;


class GetSettingInputSystemsCommand
{

	/**
	 * @var array
	 */
	var $_result;

	/**
	 * @param LexProject
	 */
	var $_lexProject;

	/**
	 * 
	 * @param LexProject $lexProject
	 */
	function __construct($lexProject) {
		$this->_lexProject = $lexProject; // Path to the selected project
	}

	function execute() {
		$this->processFile();
		return $this->_result;
	}

	function processFile() {
		$ldmls = array();
		$writingSystemsPath = $this->_lexProject->writingSystemsFolderPath();
		if (!defined ("TestMode")) {
			if (!file_exists($writingSystemsPath))
			{
				$fixer = new LexProjectFixer($this->_lexProject->projectModel);
				$fixer->fixProjectVLatest($this->_lexProject);
			}
		} 
		
		
		$filesPath = glob($writingSystemsPath ."*.ldml");
		foreach ($filesPath as &$filePath) {
			$xml_str = file_get_contents($filePath);
			$doc = new \DOMDocument;
			$doc->preserveWhiteSpace = FALSE;
			$doc->loadXML($xml_str);
			$ldmls[] = InputSystemXmlJsonMapper::encodeInputSystemXmlToJson($doc);
		}
		
		$this->_result = array(
			"list" => $ldmls
		);
	}

};

?>
