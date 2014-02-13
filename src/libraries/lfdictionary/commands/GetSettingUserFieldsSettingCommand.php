<?php
namespace libraries\lfdictionary\commands;
use libraries\lfdictionary\environment\LexProject;

use \libraries\lfdictionary\mapper\FieldSettingXmlJsonMapper;

require_once(dirname(__FILE__) . '/../Config.php');

class GetSettingUserFieldsSettingCommand {

	/**
	 * @var JSON
	 */
	var $_result;

	/**
	 * @param LexProject $_lexProject
	 */
	private $_lexProject;
	/**
	 * @param string
	 */
	var $_userName;

	/**
	 * 
	 * @param LexProject $lexProject
	 * @param string $userName
	 */
	function __construct($lexProject, $userName) {
		$this->_lexProject = $lexProject;
		$this->_userName = $userName;
	}

	function execute() {
		$this->processFile();
		return $this->_result;
	}

	function processFile() {
		$configFilePath = $this->_lexProject->getUserOrDefaultProjectSettingsFilePath($this->_userName);
		$xml_str = file_get_contents($configFilePath);
		$doc = new \DOMDocument;
		$doc->preserveWhiteSpace = FALSE;
		$doc->loadXML($xml_str);
		$componentsDoc = new \DomDocument;
		$componentsDoc->appendChild($componentsDoc->importNode($doc->getElementsByTagName("fields")->item(0), true));
		$this->_result = FieldSettingXmlJsonMapper::encodeFieldXmlToJson($componentsDoc);
	}


};

?>
