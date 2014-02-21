<?php
namespace libraries\lfdictionary\mapper;
require_once(dirname(__FILE__) . '/../Config.php');

// TODO Delete. Field settings are now going to be stored in the mongo db.  We need a model to suit, but use mongo mapper to persist. CP 2013-12
class FieldSettingXmlJsonMapper {
	const FIELD_AVAILABLEWRITINGSYSTEMS = "availableWritingSystems";
	const FIELD_WRITINGSYSTEMS = "writingSystems";
	const FIELD_VISIBILITY = "visibility";
	const FIELD_OPTIONSLISTFILE = "optionsListFile";
	const FIELD_MULTIPLICITY = "multiplicity";
	const FIELD_SPELLCHECKINGENABLED = "spellCheckingEnabled";
	const FIELD_MULTIPARAGRAPH = "multiParagraph";
	const FIELD_FIELDNAME = "fieldName";
	const FIELD_ENABLED = "enabled";
	const FIELD_DISPLAYNAME = "displayName";
	const FIELD_DATATYPE = "dataType";
	const FIELD_CLASSNAME = "className";
	const FIELD_ID = "id";
	const FIELD_FIELDS = "fields";
	const FIELD_FIELD = "field";
	const FIELD_INDEX = "index";
	public static function updateFieldXmlFromJson($json, $dom)
	{
		if (property_exists($json, self::FIELD_FIELDS) )
		{
			$subField = $json->fields->field;
			foreach ($subField as $value) {
				$fieldProperties = array();
				foreach ($value as  $key => $fieldProperty) {
					if (!is_string($fieldProperty) && is_object($fieldProperty)) {
						foreach ($fieldProperty as  $subPropertykey => $fieldSubProperty) {
							if ($subPropertykey==="$")
							{
								$fieldProperties[$key] = $fieldSubProperty;
							}elseif(is_array($fieldSubProperty) && $subPropertykey===self::FIELD_ID)
							{
								$writingSystems = array();
								foreach ($fieldSubProperty as $writingSystem)
								{
									$writingSystems[] = $writingSystem;
								}
								$fieldProperties[$key] = $writingSystems;
							}
						}
					}else{
						$fieldProperties[$key] = $fieldProperty;
					}
				}
				//one field properties done, update to Xml;
				self::updateXmlNode($dom, $fieldProperties);
			}
		}
	}

	private static function updateXmlNode($dom, $fieldNewProperties)
	{

		$fieldName=$fieldNewProperties[self::FIELD_FIELDNAME];
		$fieldIndex=$fieldNewProperties[self::FIELD_INDEX];
		$xpath = new \DOMXPath($dom);

		// get related field.
		$entries = $xpath->query('//configuration/components/viewTemplate/fields/field[@index="' . $fieldIndex . '"]');
		if ($entries->length==1)
		{
			$entryParent= $entries->item(0);
			foreach ($fieldNewProperties as  $key => $fieldProperty) {

				$innerEntry = $xpath->query(".//" .  $key, $entryParent);
				if ($innerEntry->length==1)
				{
					$innerEntryNode = $innerEntry->item(0);
					
					if ($key==self::FIELD_FIELDNAME)
					{
						// just fieldName. should not change.
						continue;
					}
					elseif ($key==self::FIELD_AVAILABLEWRITINGSYSTEMS || $key==self::FIELD_WRITINGSYSTEMS)
					{
						//remove all exist node and re-add them
						while ($innerEntryNode->childNodes->length){
							$innerEntryNode->removeChild($innerEntryNode->firstChild);
						}
						if(is_array($fieldProperty))
						{
							if (count($fieldProperty)>0)
							{
								foreach ($fieldProperty as $writeSystem){
									foreach ($writeSystem as  $writeSystemValue){
									
										$newIdNode = $dom->createElement(self::FIELD_ID,$writeSystemValue);
										$innerEntryNode->appendChild($newIdNode);
									}

								}
							}
						}
						continue;
					}

					$innerEntryNode->nodeValue = $fieldNewProperties[$key];
					
				}else if ($innerEntry->length==0)
				{
					if ($key==self::FIELD_INDEX)
					{
						// we do not need this one
						continue;
					}
					
					// something new for configration file
					if ($key==self::FIELD_AVAILABLEWRITINGSYSTEMS || $key==self::FIELD_WRITINGSYSTEMS)
					{
						// they are array, should be!
						if(is_array($fieldProperty))
						{
							if (count($fieldProperty)>0)
							{
								$newWriteingSystemsNode = $dom->createElement($key);
								foreach ($fieldProperty as $writeSystem){
									foreach ($writeSystem as  $writeSystemValue){
						
										$newIdNode = $dom->createElement(self::FIELD_ID,$writeSystemValue);
										$newWriteingSystemsNode->appendChild($newIdNode);
									}
								}
								$entryParent->appendChild($newWriteingSystemsNode);
							}
						}
						
					}else
					{
						$newNode = $dom->createElement($key, $fieldNewProperties[$key]);
						$entryParent->appendChild($newNode);
					}
					
				}
			}
		}else
		{
			throw new \RuntimeException("Missmatched fieldname: " .$fieldName . " fieldindex: " . $fieldIndex);
		}
	}


	public static function encodeFieldXmlToJson($node)
	{
		$subFields= array();
		if ($node->childNodes && $node->childNodes->item(0)->nodeName===self::FIELD_FIELDS) {
			//top node is Fields, so drop it
			$fieldsNode= $node->childNodes->item(0);
			foreach ($fieldsNode->childNodes as $child) {
				$fieldAttributes = array();
				foreach ($child->childNodes as $propertyChild) {
					switch ($propertyChild->nodeName) {
						case self::FIELD_AVAILABLEWRITINGSYSTEMS :
						case self::FIELD_WRITINGSYSTEMS :
							if ($propertyChild->childNodes)
							{
								$writingSystem = array();
								foreach ($propertyChild->childNodes as $writingSystemChild) {
									$writingSystem[] = array("$" => $writingSystemChild->nodeValue);
								}
								$fieldAttributes[$propertyChild->nodeName] = array(self::FIELD_ID => $writingSystem);
							}else{
								$fieldAttributes[$propertyChild->nodeName] = array(self::FIELD_ID => array());
							}
							break;
						case self::FIELD_VISIBILITY :
						case self::FIELD_OPTIONSLISTFILE :
						case self::FIELD_MULTIPLICITY :
						case self::FIELD_SPELLCHECKINGENABLED :
						case self::FIELD_MULTIPARAGRAPH :
						case self::FIELD_FIELDNAME :
						case self::FIELD_ENABLED :
						case self::FIELD_DISPLAYNAME :
						case self::FIELD_DATATYPE :
						case self::FIELD_CLASSNAME :
							if ($propertyChild->nodeValue=="")
							{
								$fieldAttributes[$propertyChild->nodeName] = array();
							}else{
								$fieldAttributes[$propertyChild->nodeName] = array("$" => $propertyChild->nodeValue);
							}
							break;
						default:
							//not supports!
							break;
					}
				}
				$fieldAttributes["index"] = $child->getAttribute(self::FIELD_INDEX);
				$subFields[]= $fieldAttributes;
			}
		}
		$result =  array(
		 					self::FIELD_FIELDS => array (self::FIELD_FIELD => $subFields)
		);
		return $result;
	}

};

?>