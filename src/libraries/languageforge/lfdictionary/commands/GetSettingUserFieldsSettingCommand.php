<?php
namespace libraries\lfdictionary\commands;

use \libraries\lfdictionary\environment\LexProject;
use \libraries\lfdictionary\mapper\FieldSettingXmlJsonMapper;

require_once(dirname(__FILE__) . '/../Config.php');

/* REVIEWED CP 2013-12: This 'command' uses the FieldSettingXmlJsonMapper to go straight to Dto without an intervening model.
 * TODO Enhance. Add a model to go with the mapper.  Then the dto can be generated using JsonEncoder. CP 2013-12
 * TODO Enhance. Persist the model to mongo via mongomapper CP 2013-12
 * @see FieldSettingXmlJsonMapper
 */
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
