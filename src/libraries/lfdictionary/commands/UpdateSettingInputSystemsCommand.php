<?php
namespace libraries\lfdictionary\commands;
use libraries\lfdictionary\environment\LexProject;

require_once(dirname(__FILE__) . '/../Config.php');

use libraries\lfdictionary\mapper\InputSystemXmlJsonMapper;
class UpdateSettingInputSystemsCommand
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
	 * @param string $projectPath
	 */
	var $_json;

	/**
	 * 
	 * @param LexProject $lexProject
	 * @param string $inputSystems - json data
	 */
	function __construct($lexProject,$inputSystems) {
		$this->_lexProject = $lexProject; // Path to the selected project
		$this->_json=$inputSystems;
	}

	function execute() {
		$this->processFile();
		return $this->_result;
	}

	function processFile() {
		$folderPath = $this->_lexProject->writingSystemsFolderPath();

		$json = json_decode($this->_json);
		//after json decode, shold no problem to create xml file.
		//remove all old ldml files.
		$this->recursiveDelete($folderPath);

		if (!file_exists($folderPath)) {
			mkdir($folderPath, 0777);
		}
		
		foreach ($json->list as  $value) {
			$doc = new \DOMDocument;
			$doc->preserveWhiteSpace = FALSE;
			$doc->loadXML(InputSystemXmlJsonMapper::createInputSystemXmlFromJson($value));
			$doc->formatOutput=true;
			$doc->encoding="utf-8";
			$fileNameWExt = $this->getUniFileName($folderPath,$this->getFileNameByXmlData($doc));
			$doc->save($fileNameWExt);
		}
	}

	/*
	 * the file name may be duplicated, so we added a number in to the file name
	 */
	function getUniFileName($folderPath, $fileName)
	{
		$index=0;
		while (true) {
			
			if ($index==0)
			{
				$fileNameWExt=$fileName . ".ldml";
			}else
			{
				$stringIndex=(string)$index;
				$fileNameWExt=$fileName . "_" . $stringIndex . ".ldml";
			}
			if (!file_exists($folderPath . $fileNameWExt))
			{
				return $folderPath . $fileNameWExt;
			}else
			{
				$index+=1;
			}
		}
	}

	/*
	 * look at WeSay, the saved ldml file name some how related to it's data.
	 */
	function getFileNameByXmlData($doc)
	{
		$identity=$doc->getElementsByTagName('identity')->item(0);
		$languageTypeString="";
		$scriptTypeString="";
		$territoryTypeString="";
		$variantTypeString="";

		$fileName="";

		$languageType=$identity->getElementsByTagName('language')->item(0);
		if ($languageType!=null)
		{
			$languageTypeString=$languageType->getAttribute('type');
			if ($languageTypeString!="")
			{
				$fileName=$languageTypeString;
			}else
			{
				$fileName="Language Not Listed";
			}
		}

		$scriptType=$identity->getElementsByTagName('script')->item(0);
		if ($scriptType!=null)
		{
			$scriptTypeString=$scriptType->getAttribute('type');
			if ($scriptTypeString!="")
			{
				if (!$this->endsWith($fileName,"-"))
				{
					$fileName.="-";
				}
				$fileName.=$scriptTypeString;
			}
		}
		$territoryType=$identity->getElementsByTagName('territory')->item(0);
		if ($territoryType!=null)
		{
			$territoryTypeString=$territoryType->getAttribute('type');
			if ($territoryTypeString!="")
			{
				if (!$this->endsWith($fileName,"-"))
				{
					$fileName.="-";
				}
				$fileName.=$territoryTypeString;
			}
		}

		$variantType=$identity->getElementsByTagName('variant')->item(0);
		if ($variantType!=null)
		{
			$variantTypeString=$variantType->getAttribute('type');
			if ($variantTypeString!="")
			{
				if (!$this->endsWith($fileName,"-"))
				{
					$fileName.="-";
				}
				$fileName.=$variantTypeString;
			}
		}
		if ($this->endsWith($fileName,"-"))
		{
			$fileName = substr($fileName,0,-1);
		}
		return $fileName;
	}


	function endsWith($haystack, $needle)
	{
		$length = strlen($needle);
		$start  = $length * -1; //negative
		return (substr($haystack, $start) === $needle);
	}

	function recursiveDelete($str) {
		if(is_file($str)) {
			return @unlink($str);
		} elseif(is_dir($str)) {
			$str = rtrim($str, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
			$objects = scandir($str);
			foreach ($objects as $object) {
				if ($object === "." || $object === "..") {
					continue;
				}
				self::recursiveDelete($str . $object);
			}
			reset($objects);
			@rmdir($str);
		}	
	}
	
};

?>
