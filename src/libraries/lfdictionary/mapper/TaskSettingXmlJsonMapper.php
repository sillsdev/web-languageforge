<?php
namespace libraries\lfdictionary\mapper;
require_once(dirname(__FILE__) . '/../Config.php');


class TaskSettingXmlJsonMapper {
	//task setting attribute

	const TASK_TASKNAME = "taskName";
	const TASK_TASKSPECIFIEDDATA = "taskspecifieddata";
	const TASK_WORDLISTWRITINGSYSTEMID = "wordListWritingSystemId";
	const TASK_WORDLISTFILENAME = "wordListFileName";
	const TASK_SEMANTICDOMAINSQUESTIONFILENAME = "semanticDomainsQuestionFileName";
	const TASK_SHOWEXAMPLETRANSLATIONFIELD = "showExampleTranslationField";
	const TASK_SHOWEXAMPLESENTENCEFIELD = "showExampleSentenceField";
	const TASK_SHOWPOSFIELD = "showPOSField";
	const TASK_SHOWGLOSSFIELD = "showGlossField";
	const TASK_SHOWMEANINGFIELD = "showMeaningField";
	const TASK_WRITINGSYSTEMSWHICHAREREQUIRED = "writingSystemsWhichAreRequired";
	const TASK_WRITINGSYSTEMSTOMATCH = "writingSystemsToMatch";
	const TASK_READONLY = "readOnly";
	const TASK_SHOWFIELDS = "showFields";
	const TASK_FIELD = "field";
	const TASK_DESCRIPTION = "description";
	const TASK_LONGLABEL = "longLabel";
	const TASK_LABEL = "label";
	const TASK_VISIBLE = "visible";

	const TASK_TASKNAME_ADDMISSINGINFO = "AddMissingInfo";
	const TASK_TASKNAME_GATHERWORDLIST = "GatherWordList";

	const TASK_MISSINGINFO_FIELD_DEFINITION = "definition";
	const TASK_MISSINGINFO_FIELD_POS = "POS";
	const TASK_MISSINGINFO_FIELD_EXAMPLESENTENCE = "ExampleSentence";

	const TASK_TASKS = "tasks";
	const TASK_TASK = "task";
	const TASK_INDEX = "index";
	public static function updateTaskXmlFromJson($json, $dom)
	{
		if (property_exists($json, self::TASK_TASKS) )
		{
			$subTask = $json->tasks->task;
			foreach ($subTask as $value) {
				$taskProperties = array();
				foreach ($value as  $key => $taskProperty) {
					if (!is_string($taskProperty) && is_object($taskProperty)) {
						foreach ($taskProperty as  $subPropertykey => $taskSubProperty) {
							if ($subPropertykey==="$")
							{
								$taskProperties[$key] = $taskSubProperty;
							}
						}
					}else{
						$taskProperties[$key] = $taskProperty;
					}
				}
				//one task properties done, update to Xml;
				self::updateXmlNode($dom, $taskProperties);
			}
		}
	}

	private static function updateXmlNode($dom, $taskNewProperties)
	{
		$taskName=$taskNewProperties[self::TASK_TASKNAME];
		$taskIndex=$taskNewProperties[self::TASK_INDEX];
		$xpath = new \DOMXPath($dom);

		// get related task.
		$entries = $xpath->query('//configuration/tasks/task[@index="' . $taskIndex . '"]');

		switch ($taskName)
		{
			case self::TASK_TASKNAME_ADDMISSINGINFO:

				$missingInfoField = $taskNewProperties[self::TASK_FIELD];
				$query= '//configuration/tasks/task[@taskName="' . $taskName . '" and @index="' . $taskIndex . '" and field="' . $missingInfoField . '"]';
				$missingInfoNodeList = $xpath->query($query);
				if ($missingInfoNodeList->length!=1)
				{
					throw new \RuntimeException("Unknown MissingInfo Field: " .$missingInfoField . " " .$missingInfoNodeList->length );
				}
				$missingInfoNode=$missingInfoNodeList->item(0);

				//ADDINFO-VISIBLE
				if (strtolower($taskNewProperties[self::TASK_VISIBLE])=="true")
				{
					$missingInfoNode->setAttribute(self::TASK_VISIBLE,"true");
				}else
				{
					$missingInfoNode->setAttribute(self::TASK_VISIBLE,"false");
				}

				//ADDINFO-DESCRIPTION
				$innerEntry = $xpath->query(self::TASK_DESCRIPTION, $missingInfoNode);
				if ($innerEntry->length==1 && array_key_exists(self::TASK_DESCRIPTION, $taskNewProperties))
				{
					$innerEntry->item(0)->nodeValue = $taskNewProperties[self::TASK_DESCRIPTION];
				}

				//ADDINFO-LABEL
				$innerEntry = $xpath->query(self::TASK_LABEL, $missingInfoNode);
				if ($innerEntry->length==1)
				{
					$innerEntry->item(0)->nodeValue = $taskNewProperties[self::TASK_LABEL];
				}

				//ADDINFO-LONGLABEL
				$innerEntry = $xpath->query(self::TASK_LONGLABEL, $missingInfoNode);
				if ($innerEntry->length==1 && array_key_exists(self::TASK_LONGLABEL, $taskNewProperties))
				{
					$innerEntry->item(0)->nodeValue = $taskNewProperties[self::TASK_LONGLABEL];
				}

				//ADDINFO-SHOWFIELDS
				$innerEntry = $xpath->query(self::TASK_SHOWFIELDS, $missingInfoNode);
				if ($innerEntry->length==1 && array_key_exists(self::TASK_SHOWFIELDS, $taskNewProperties))
				{
					$innerEntry->item(0)->nodeValue = $taskNewProperties[self::TASK_SHOWFIELDS];
				}

				//ADDINFO-READONLY
				$innerEntry = $xpath->query(self::TASK_READONLY, $missingInfoNode);
				if ($innerEntry->length==1 && array_key_exists(self::TASK_READONLY, $taskNewProperties))
				{
					$arr = $taskNewProperties[self::TASK_READONLY];
					if (is_array($arr))
					{
						if (count($arr)==1){
							$innerEntry->item(0)->nodeValue = $arr[0];
						}else
						{
							$innerEntry->item(0)->nodeValue="";
						}
					}else
					{
						$innerEntry->item(0)->nodeValue = $taskNewProperties[self::TASK_READONLY];
					}
				}

				break;
			case self::TASK_TASKNAME_GATHERWORDLIST:


				if (array_key_exists(self::TASK_WORDLISTFILENAME, $taskNewProperties))
				{
					// from word list
					$gatherWordListNodeList = $xpath->query('//configuration/tasks/task[@taskName="' . $taskName . '" and @index="' . $taskIndex . '"  and wordListFileName="' . $taskNewProperties[self::TASK_WORDLISTFILENAME] . '"]');

					if ($gatherWordListNodeList->length==1)
					{
						if (strtolower($taskNewProperties[self::TASK_VISIBLE])=="true")
						{
							$gatherWordListNodeList->item(0)->setAttribute(self::TASK_VISIBLE,"true");
						}else
						{
							$gatherWordListNodeList->item(0)->setAttribute(self::TASK_VISIBLE,"false");
						}

						$innerEntry = $xpath->query(self::TASK_WORDLISTWRITINGSYSTEMID, $gatherWordListNodeList->item(0));
						if ($innerEntry->length==1 && array_key_exists(self::TASK_WORDLISTWRITINGSYSTEMID, $taskNewProperties))
						{
							$innerEntry->item(0)->nodeValue = $taskNewProperties[self::TASK_WORDLISTWRITINGSYSTEMID];
						}
					}
				}else
				{
					//from text
					$gatherWordListNodeList = $xpath->query('//configuration/tasks/task[@taskName="' . $taskName . '"  and @index="' . $taskIndex . '" ]');

					foreach ($gatherWordListNodeList as $gatherWordListNode)
					{
						$isFromTextTask=true;
						foreach ($gatherWordListNode->childNodes as $gatherWordListSubNode)
						{
							if ($gatherWordListSubNode->nodeName===self::TASK_WORDLISTFILENAME)
							{
								$isFromTextTask=false;
								break;
							}
						}
						if ($isFromTextTask)
						{
							if (strtolower($taskNewProperties[self::TASK_VISIBLE])=="true")
							{
								$gatherWordListNode->setAttribute(self::TASK_VISIBLE,"true");
							}else
							{
								$gatherWordListNode->setAttribute(self::TASK_VISIBLE,"false");
							}

							$innerEntry = $xpath->query(self::TASK_LONGLABEL, $gatherWordListNode);
							if ($innerEntry->length==1 && array_key_exists(self::TASK_LONGLABEL, $taskNewProperties))
							{
								$innerEntry->item(0)->nodeValue = $taskNewProperties[self::TASK_LONGLABEL];
							}
						}
					}
				}



				break;
			default:
				// must have one. here we have normal case
				if ($entries->length==1)
				{
					$entry = $entries->item(0);

					foreach ($taskNewProperties as  $key => $taskProperty) {
						if ($key==self::TASK_TASKNAME)
						{
							// just taskname. should not change.
							continue;
						}elseif ($key==self::TASK_VISIBLE)
						{
							//VISIBLE is a Attribute
							if (strtolower($taskNewProperties[self::TASK_VISIBLE])=="true")
							{
								$entry->setAttribute(self::TASK_VISIBLE,"true");
							}else
							{
								$entry->setAttribute(self::TASK_VISIBLE,"false");
							}
							continue;
						}
						$innerEntry = $xpath->query($key, $entry);
						if ($innerEntry->length==1)
						{
							$innerEntry->item(0)->nodeValue = $taskNewProperties[$key];
						}else {
							// new Property
							$newNode = $dom->createElement($key, $taskNewProperties[$key]);
							$entry->appendChild($newNode);
						}
					}
				}
				break;
		}
	}


	public static function encodeTaskXmlToJson($node)
	{
		$subTasks= array();
		if ($node->childNodes && $node->childNodes->item(0)->nodeName===self::TASK_TASKS) {
			//top node is Tasks, so drop it
			$tasksNode= $node->childNodes->item(0);
			foreach ($tasksNode->childNodes as $child) {
				$taskAttributes = array();
				$taskAttributes[self::TASK_TASKNAME] = $child->getAttribute(self::TASK_TASKNAME);
				$taskAttributes[self::TASK_VISIBLE] = $child->getAttribute(self::TASK_VISIBLE);
				foreach ($child->childNodes as $propertyChild) {
					switch ($propertyChild->nodeName) {
						case self::TASK_TASKNAME:
						case self::TASK_TASKSPECIFIEDDATA:
						case self::TASK_WORDLISTWRITINGSYSTEMID:
						case self::TASK_WORDLISTFILENAME:
						case self::TASK_SEMANTICDOMAINSQUESTIONFILENAME:
						case self::TASK_SHOWEXAMPLETRANSLATIONFIELD:
						case self::TASK_SHOWEXAMPLESENTENCEFIELD:
						case self::TASK_SHOWPOSFIELD:
						case self::TASK_SHOWGLOSSFIELD:
						case self::TASK_SHOWMEANINGFIELD:
						case self::TASK_WRITINGSYSTEMSWHICHAREREQUIRED:
						case self::TASK_WRITINGSYSTEMSTOMATCH:
						case self::TASK_READONLY:
						case self::TASK_SHOWFIELDS:
						case self::TASK_FIELD:
						case self::TASK_DESCRIPTION:
						case self::TASK_LONGLABEL:
						case self::TASK_LABEL:
						case self::TASK_VISIBLE:
							if ($propertyChild->nodeValue=="")
							{
								$taskAttributes[$propertyChild->nodeName] = array();
							}else{
								$taskAttributes[$propertyChild->nodeName] = array("$" => $propertyChild->nodeValue);
							}
								
								
							break;
						default:
							//not supports!
							break;
					}
				}
				$taskAttributes["index"] = $child->getAttribute(self::TASK_INDEX);
				$subTasks[]= $taskAttributes;
			}
		}
		$result =  array(
				self::TASK_TASKS => array (self::TASK_TASK => $subTasks)
		);
		return $result;
	}


};

?>