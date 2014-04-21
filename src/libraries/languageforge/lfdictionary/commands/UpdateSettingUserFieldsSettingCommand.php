<?php
namespace libraries\lfdictionary\commands;
use libraries\lfdictionary\environment\LexProject;
use \libraries\lfdictionary\mapper\FieldSettingXmlJsonMapper;

require_once(dirname(__FILE__) . '/../Config.php');

// TODO Refactor. Need the WritingSystemModel with encoder / decoder and mapper.
// TODO Enhance. Need to store the model in mongo.
class UpdateSettingUserFieldsSettingCommand
{
	/**
	 * @var array
	 */
	private $_result;

	/**
	 * @param LexProject
	 *
	 */
	 private $_lexProject;

	 /**
	 * @param string
	 */
	private $_json;

	/**
	 * @param string
	 */
	private $_userNames;

	/**
	 * 
	 * @param LexProject $lexProject
	 * @param array $userNames
	 * @param string $fields - json data
	 */
	function __construct($lexProject, $userNames, $fields) {
		$this->_lexProject = $lexProject;
		$this->_json=$fields;
		$this->_userNames=$userNames;
	}

	function execute() {
		$this->processFile();
		return $this->_result;
	}

	function processFile() {

		$json = json_decode($this->_json);

		//apply too all in list
		foreach ($this->_userNames as &$userName) {
			$this-> persistTasks($userName,$json);
		}
		$this->_result = $json;
		return;
	}

	private function persistTasks($strName,$newSetting)
	{
		$filePath = $this->_lexProject->getUserOrDefaultProjectSettingsFilePath($strName);
		$xml_str = file_get_contents($filePath);
		$doc = new \DOMDocument;
		$doc->preserveWhiteSpace = FALSE;
		$doc->loadXML($xml_str);
		FieldSettingXmlJsonMapper::updateFieldXmlFromJson($newSetting,$doc);
		$doc->save($this->_lexProject->getUserSettingsFilePath($strName));
	}


};

?>
