<?php
namespace libraries\lfdictionary\commands;

use libraries\lfdictionary\environment\LexProject;

use \libraries\lfdictionary\mapper\TaskSettingXmlJsonMapper;

use \libraries\lfdictionary\environment\LexProjectUserSettings;

use \libraries\lfdictionary\environment\LexClientEnvironment;

require_once(dirname(__FILE__) . '/../Config.php');

class UpdateSettingUserTasksSettingCommand
{
	/**
	 * @var array
	 */
	private $_result;

	/**
	 * @param LexProject
	 */
	 private $_lexProject;
	 

	 /**
	 * @param string
	 */
	private $_json;

	/**
	 * @param array
	 */
	private $_userNames;

	/**
	 * 
	 * @param LexProject $lexProject
	 * @param array $userNames
	 * @param string $tasks - json data
	 */
	function __construct($lexProject, $userNames, $tasks) {
		$this->_lexProject = $lexProject; // Path to the selected project
		$this->_json=$tasks;
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
	}

	private function persistTasks($strName,$newSetting)
	{
		$filePath = $this->_lexProject->getUserOrDefaultProjectSettingsFilePath($strName);
		$xml_str = file_get_contents($filePath);
		$doc = new \DOMDocument;
		$doc->preserveWhiteSpace = FALSE;
		$doc->loadXML($xml_str);
		TaskSettingXmlJsonMapper::updateTaskXmlFromJson($newSetting,$doc);
		$doc->save($this->_lexProject->getUserSettingsFilePath($strName));
	}

};

?>
