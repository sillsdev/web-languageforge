<?php
/**
 * This Class defines the Project required Information.
 * LanguageForge Dictionary API
 * @author Arivusudar
 */
namespace libraries\lfdictionary\environment;
use \libraries\lfdictionary\mapper\TaskSettingXmlJsonMapper;
use libraries\lfdictionary\environment\LexProject;

error_reporting(E_ALL | E_STRICT);
require_once(dirname(__FILE__) . '/../Config.php');

// This class is lexicon specific

use models\UserModel;
use models\ProjectModel;
use \libraries\lfdictionary\environment\TaskSettingsModel;
use \libraries\lfdictionary\common\LoggerFactory;
class LexProjectUserSettings
{
	
	// fieldsettings' type
	const FOR_BASE = 0;
	const FOR_ADD_EXAMPLE_MODEL = 1;
	const FOR_ADD_MEANING_MODEL = 2;
	const FOR_ADD_POS_MODEL = 3;
	const FOR_GATHER_WORD_FROM_WORD_LIST = 4;
	const FOR_GATHER_WORD_FROM_SEMANTIC_DOMAIN = 5;

	/**
	 * @var ProjectModel
	 */
	private $_projectModel;

	/**
	 * 
	 * @var LexProject
	 */
	private $_lexProject;
	
	/**
	 * @var UserModel
	 */
	var $_userModel;


	/**
	 * @var string
	 */
	var $_projectPath;


	/**
	 * @var array
	 */
	var $_fieldSettings;

	/**
	 * @var array
	 */
	private $_taskSettings;

	/**
	 * @var DOMDocument
	 */
	var $_componentsDocTasks;

	/**
	 * @var DOMDocument
	 */
	var $_componentsDocFields;

	function __construct($projectModel, $userModel) {
		
		if (!is_a($projectModel, '\models\ProjectModel')) {
			throw new \Exception('Type error: ProjectModel');
		}
		$this->_projectModel = $projectModel;
		$this->_userModel = $userModel;
		$this->_lexProject = new LexProject($projectModel);	
		$this->_projectPath = $this->_lexProject->projectPath;
		$this->load();
	}

	private function load() {
		// use user name may not a good idea, Linux box is case sensitve,
		// so all user name will save in lowercase
		$userName = $this->_userModel->username;
		$userName = mb_strtolower($userName, mb_detect_encoding($userName));

		$filePath = $this->_lexProject->getUserOrDefaultProjectSettingsFilePath($userName);
		if (!file_exists($filePath)) {
			// This would really be bad. The LexProjectFixer should have made things right.
			throw new \Exception(sprintf("Project user settings file '%s' not found for user '%s'", $filePath, $this->_userModel->username));
		}
		
		LoggerFactory::getLogger()->logInfoMessage(sprintf("LexProjectUserSettings: %s (%s) using settings '%s'",
			$this->_userModel->username,
			$this->_userModel->id,
			$filePath
		));

		$doc = new \DOMDocument;
		$doc->preserveWhiteSpace = FALSE;
		$doc->load($filePath);
		//try to fix / add those missing fields. 
		// it will save file once after progress.
		new LexProjectConfigrationFileFixer($doc, $filePath);
		$this->_componentsDocFields = new \DOMDocument;
		$this->_componentsDocTasks = new \DOMDocument;
		
		$this->_componentsDocFields->appendChild($this->_componentsDocFields->importNode($doc->getElementsByTagName("fields")->item(0), true));
		$this->_componentsDocTasks->appendChild($this->_componentsDocTasks->importNode($doc->getElementsByTagName("tasks")->item(0), true));
		$this->_taskSettings = TaskSettingXmlJsonMapper::encodeTaskXmlToJson($this->_componentsDocTasks);
	}



	private function progressXmlData($document)
	{
		if ($document && $document->childNodes->item(0)) {
			$fieldsList=$document->childNodes->item(0)->childNodes;
			//get each field setting
			foreach ($fieldsList as $field) {

				if ((is_null($field) || get_class($field)!="DOMElement"))
				{
					throw new \Exception("User profile broken!");
				}

				$fieldClassName=$field->getElementsByTagName("className")->item(0)->nodeValue;
				$fieldDataType=$field->getElementsByTagName("dataType")->item(0)->nodeValue;
				$fieldName=$field->getElementsByTagName("fieldName")->item(0)->nodeValue;

				if (is_null($fieldClassName) || is_null($fieldDataType) || is_null($fieldName))
				{
					continue;
				}

				$selectField=null;
				switch ($fieldClassName) {
					case "LexEntry":
						if (strcasecmp($fieldDataType,"MultiText")==0 && strcasecmp($fieldName,"EntryLexicalForm")==0)
						{
							$this->updateFieldNode($this->_fieldSettings["Word"],$field);
						}
							
							
						break;
					case "LexSense":

						if (strcasecmp($fieldDataType,"Option")==0  && strcasecmp($fieldName,"POS")==0 )
						{
							$this->updateFieldNode($this->_fieldSettings["POS"],$field);
						}else if(strcasecmp($fieldDataType,"MultiText")==0 && strcasecmp($fieldName,"definition")==0)
						{
							$this->updateFieldNode($this->_fieldSettings["Definition"],$field);
						}else if(strcasecmp($fieldDataType,"MultiText")==0 && strcasecmp($fieldName,"NewDefinition")==0)
						{
							$this->updateFieldNode($this->_fieldSettings["NewMeaning"],$field);
						}
						break;
					case "LexExampleSentence":
						if (strcasecmp($fieldDataType,"MultiText")==0 && strcasecmp($fieldName,"ExampleSentence")==0)
						{
							$this->updateFieldNode($this->_fieldSettings["Example"],$field);
						}else if(strcasecmp($fieldDataType,"MultiText")==0 && strcasecmp($fieldName,"ExampleTranslation")==0)
						{
							$this->updateFieldNode($this->_fieldSettings["Translation"],$field);
						}else if(strcasecmp($fieldDataType,"MultiText")==0 && strcasecmp($fieldName,"NewExampleSentence")==0)
						{
							$this->updateFieldNode($this->_fieldSettings["NewExample"],$field);
						}
						break;

					default:
						continue;
				}

			}
		}
	}

	private function updateFieldNode(&$fieldSetting, &$field) {
		if (is_null($fieldSetting) || is_null($field)) {
			throw new \Exception("Cannot find match field setting");
		}

		$visibility = $field->getElementsByTagName("visibility")->item(0)->nodeValue;
		$displayName = $field->getElementsByTagName("displayName")->item(0)->nodeValue;
		$enabled = $field->getElementsByTagName("enabled")->item(0)->nodeValue;
		$writingSystemsList = $field->getElementsByTagName("writingSystems")->item(0)->childNodes;

		$fieldSetting["Label"]=$displayName;
		$fieldSetting["Visible"]=$visibility;
		if ($fieldSetting["Enabled"]==true){
			// allow user change it!
			if (strtoupper($enabled)==="TRUE")
			{
				$fieldSetting["Enabled"]= true;
			}else
			{
				$fieldSetting["Enabled"]= false;
			}
		}
		$fieldSetting["Languages"]= array();
		foreach ($writingSystemsList as $writingSystem) {
			$fieldSetting["Languages"][]=$writingSystem->nodeValue;
		}

		//get abbreviations in the same sequnce of languages
		$fieldSetting["Abbreviations"]= array();
		foreach ($writingSystemsList as $writingSystem) {
			$writingSystemFile=$this->_lexProject->writingSystemsFolderPath() . $writingSystem->nodeValue . ".ldml";
			if (file_exists($writingSystemFile)) {
				// we have it, load.
				$doc = new \DOMDocument;
				$doc->preserveWhiteSpace = FALSE;
				$doc->load($writingSystemFile);
				$abbreviation= $doc->getElementsByTagNameNS('urn://palaso.org/ldmlExtensions/v1', 'abbreviation')->item(0)->getAttribute('value');
				$fieldSetting["Abbreviations"][]=$abbreviation;
			} else {
				// file not find
				$fieldSetting["Abbreviations"][]=$writingSystem->nodeValue;
			}
		}
	}

	private function getDefaultSettingStruct(
	$wordEnabled = true,
	$posEnabled = true,
	$definitionEnabled = true,
	$exampleEnabled = true,
	$translationEnabled = true,
	$newMeaningEnabled = true,
	$newExampleEnabled = true,
	$wordReadonly = false,
	$posReadonly = false,
	$definitionReadonly = false,
	$exampleReadonly = false,
	$translationReadonly = false,
	$newMeaningReadonly = false,
	$newExampleReadonly = false) {

		//here is base field settings for each type, if set visible to false here,
		//will ignore user setting, always keep false
		return array(
			"Word" => array("Label" => "", "Languages" => array(""), "Abbreviations" => array(""), "Enabled" => $wordEnabled, "ReadonlyField"=>$wordReadonly, "Visible" => ""),
			"POS" => array("Label" => "", "Languages" => array(""), "Abbreviations" => array(""), "Enabled" => $posEnabled, "ReadonlyField"=>$posReadonly, "Visible" => ""),
			"Definition" => array("Label" => "", "Languages" => array(""), "Abbreviations" => array(""), "Enabled" => $definitionEnabled, "ReadonlyField"=>$definitionReadonly, "Visible" => ""),
			"Example" => array("Label" => "", "Languages" => array(""), "Abbreviations" => array(""), "Enabled" => $exampleEnabled, "ReadonlyField"=>$exampleReadonly, "Visible" => ""),
			"Translation" => array("Label" => "", "Languages" => array(""), "Abbreviations" => array(""), "Enabled" => $translationEnabled, "ReadonlyField"=>$translationReadonly, "Visible" => ""),
			"NewMeaning" => array("Label" => "", "Languages" => array(""), "Abbreviations" => array(""), "Enabled" => $newMeaningEnabled, "ReadonlyField"=>$newMeaningReadonly, "Visible" => ""),
			"NewExample" => array("Label" => "", "Languages" => array(""), "Abbreviations" => array(""), "Enabled" => $newExampleEnabled, "ReadonlyField"=>$newExampleReadonly, "Visible" => "")
		);
	}

	function encodeTasks() {
		return $this->_taskSettings;
	}

	function encodeFields($fieldSettingType) {
		switch ($fieldSettingType) {
			case self::FOR_BASE:
				$this->_fieldSettings= $this->getDefaultSettingStruct(true,true,true,true,true,true,true,  false,false,false,false,false,false,false);
				break;
			case self::FOR_ADD_EXAMPLE_MODEL:
				$this->_fieldSettings= $this->getDefaultSettingStruct(true,true,true,false,false,false,true,  true,true,true,false,false,false,false);
				break;
			case self::FOR_ADD_MEANING_MODEL:
				$this->_fieldSettings= $this->getDefaultSettingStruct(true,false,false,false,false,true,false,  true,false,false,false,false,false,false);
				break;
			case self::FOR_ADD_POS_MODEL:
				$this->_fieldSettings= $this->getDefaultSettingStruct(true,true,true,false,false,false,false,  true,false,true,false,false,false,false);
				break;
			case self::FOR_GATHER_WORD_FROM_WORD_LIST:
				$this->_fieldSettings= $this->getDefaultSettingStruct(true,false,false,false,false,false,false,  false,false,false,false,false,false,false);
				break;
			case self::FOR_GATHER_WORD_FROM_SEMANTIC_DOMAIN:
				$meaningFieldEnabled=false;
				$glossFieldEnabled=false;
				$exampleSentenceFieldEnabled=false;
				$exampleTranslationFieldEnabled=false;
				$posFieldEnabled=false;

				$xpath = new \DOMXPath($this->_componentsDocTasks);
				$entries = $xpath->query('//task[@taskName="GatherWordsBySemanticDomains"]');


				if ($entries->length==1)
				{
					$entry = $entries->item(0);


					$innerEntry = $xpath->query('showMeaningField', $entry);
					if ($innerEntry->length==1)
					{
						if (strtolower($innerEntry->item(0)->nodeValue)=="true")
						{
							$meaningFieldEnabled=true;
						}
					}

					$innerEntry = $xpath->query('showGlossField', $entry);
					if ($innerEntry->length==1)
					{
						if (strtolower($innerEntry->item(0)->nodeValue)=="true")
						{
							$glossFieldEnabled=true;
						}
					}


					$innerEntry = $xpath->query('showPOSField', $entry);
					if ($innerEntry->length==1)
					{
						if (strtolower($innerEntry->item(0)->nodeValue)=="true")
						{
							$posFieldEnabled=true;
						}
					}

					$innerEntry = $xpath->query('showExampleSentenceField', $entry);
					if ($innerEntry->length==1)
					{
						if (strtolower($innerEntry->item(0)->nodeValue)=="true")
						{
							$exampleSentenceFieldEnabled=true;
						}
					}

					$innerEntry = $xpath->query('showExampleTranslationField', $entry);
					if ($innerEntry->length==1)
					{
						if (strtolower($innerEntry->item(0)->nodeValue)=="true")
						{
							$exampleTranslationFieldEnabled=true;
						}
					}

				}

				$this->_fieldSettings= $this->getDefaultSettingStruct(true,$posFieldEnabled,$meaningFieldEnabled,$exampleSentenceFieldEnabled,$exampleTranslationFieldEnabled,false,false,   false,false,false,false,false,false,false);
				break;
			default:
				$this->_fieldSettings= $this->getDefaultSettingStruct(true,true,true,true,true,true,true,   false,false,false,false,false,false,false);
			break;
		}
		$this->progressXmlData($this->_componentsDocFields);
		return $this->_fieldSettings;
	}

}
?>