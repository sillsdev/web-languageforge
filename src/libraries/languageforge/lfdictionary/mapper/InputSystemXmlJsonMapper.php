<?php
namespace libraries\lfdictionary\mapper;

// TODO Refactor. This should have a model with this code as a supporting encoder and decoder (to / from ldml file) there may also be a 'mapper' which handles the file environment, duplicate / overwrite files etc CP 2013-12
// TODO The model would also use a mongoMapper to persist to the mongo database (we now want settings in the mongo database. CP 2013-12
// @see GetSettingInputSystemsCommand which is a kind of dto / model that uses this class. CP 2013-12
class InputSystemXmlJsonMapper {

	const XML_NAMESPACE_PALASO = "urn://palaso.org/ldmlExtensions/v1";

	const INPUTSYSTEM_COLLATIONS = "collations";
	const INPUTSYSTEM_IDENTITY = "identity";
	const INPUTSYSTEM_SPECIAL = "special";

	const INPUTSYSTEM_IDENTITY_GENERATION = "generation";
	const INPUTSYSTEM_IDENTITY_LANGUAGE = "language";
	const INPUTSYSTEM_IDENTITY_SCRIPT = "script";
	const INPUTSYSTEM_IDENTITY_TERRITORY = "territory";
	const INPUTSYSTEM_IDENTITY_VARIANT = "variant";
	const INPUTSYSTEM_IDENTITY_VERSION = "version";

	const INPUTSYSTEM_SPECIAL_PALASO_ABBREVIATION = "abbreviation";
	const INPUTSYSTEM_SPECIAL_PALASO_LANGUAGENAME = "languageName";
	const INPUTSYSTEM_SPECIAL_PALASO_VERSION = "version";
	const INPUTSYSTEM_SPECIAL_PALASO_DEFAULTFONTFAMILY = "defaultFontFamily";
	const INPUTSYSTEM_SPECIAL_PALASO_DEFAULTFONTSIZE = "defaultFontSize";


	const INPUTSYSTEM_COLLATIONS_COLLATION = "collation";
	const INPUTSYSTEM_COLLATIONS_COLLATION_BASE = "base";
	const INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS = "alias";
	const INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS_SOURCE = "source";
	const INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL = "special";
	const INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE = "sortRulesType";
	const INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE_VALUE = "value";

	public static function createInputSystemXmlFromJson($json)
	{
		// create new Xml by DOM with namespace supports!
		$doc = new \DOMDocument("1.0","utf-8");
		$doc->preserveWhiteSpace = FALSE;
		$doc->formatOutput=true;


		if (property_exists($json, "ldml") )
		{
			$rootNode = $doc->createElement("ldml");
			$doc->appendChild($rootNode) ;
			$inputSystemSub = $json->ldml;
			foreach ($inputSystemSub as  $key => $fieldProperty) {
				$fieldPropertyArray = (array)$fieldProperty;
				switch ($key) {
					case self::INPUTSYSTEM_COLLATIONS :
						$collationsNode = $doc->createElement(self::INPUTSYSTEM_COLLATIONS);
						$rootNode->appendChild($collationsNode) ;

						foreach ($fieldProperty as $collationKey => $collationChild) {
							foreach ($collationChild as $collationSubKey => $collationSubChild) {
								$collationNode = $doc->createElement(self::INPUTSYSTEM_COLLATIONS_COLLATION);
								$collationsNode->appendChild($collationNode);
								$collationSubChildArray= (array)$collationSubChild;
								if (array_key_exists(self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE, $collationSubChildArray))
								{
									$baseNode = $doc->createElement(self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE);
									$base = $collationSubChildArray[self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE];
									$baseArray=(array)$base;
									if (array_key_exists(self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS, $baseArray))
									{
										$alias = $baseArray[self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS];
										if (array_key_exists(self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS_SOURCE, $alias))
										{
											$aliasArray=(array)$alias;
											$sourceValue=$aliasArray[self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS_SOURCE];
											$baseNode = $doc->createElement(self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE);
											$aliasNode = $doc->createElement(self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS);
											$aliasNode->setAttribute(self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS_SOURCE, $sourceValue);
											$collationNode->appendChild($baseNode);
										}
									}
									$baseNode->appendChild($aliasNode);
								}
								if (array_key_exists(self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL, $collationSubChild))
								{
									$specialNode = $doc->createElement(self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL);
									$specialNode->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:palaso',self::XML_NAMESPACE_PALASO);
									$special = $collationSubChildArray[self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL];
									$specialArray=(array)$special;
									if (array_key_exists("palaso:".self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE, $specialArray))
									{
										$sortRulesType=$specialArray["palaso:".self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE];
										if (array_key_exists(self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE_VALUE, $sortRulesType))
										{
											$sortRulesTypeArray=(array)$sortRulesType;
											$newPreprotyNode = $doc->createElementNS(self::XML_NAMESPACE_PALASO, self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE);
											$newPreprotyNode->setAttribute(self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE_VALUE, $sortRulesTypeArray[self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE_VALUE]);
											$specialNode->appendChild($newPreprotyNode);
										}
									}
									$collationNode->appendChild($specialNode);
								}

							}

						}
						break;
					case self::INPUTSYSTEM_IDENTITY :
						$identityNode = $doc->createElement(self::INPUTSYSTEM_IDENTITY);
						$rootNode->appendChild($identityNode) ;

						foreach ($fieldProperty as $identityChildKey => $identityChild) {
							$identityChildArray = (array)$identityChild;
							$attributeName = array_keys($identityChildArray);
							switch ($identityChildKey) {
								case self::INPUTSYSTEM_IDENTITY_GENERATION:
								case self::INPUTSYSTEM_IDENTITY_LANGUAGE:
								case self::INPUTSYSTEM_IDENTITY_SCRIPT:
								case self::INPUTSYSTEM_IDENTITY_TERRITORY:
								case self::INPUTSYSTEM_IDENTITY_VARIANT:
								case self::INPUTSYSTEM_IDENTITY_VERSION:
									$identitySubNode = $doc->createElement($identityChildKey);
									$identityNode->appendChild($identitySubNode) ;
									$identitySubNode->setAttribute($attributeName[0] , $identityChildArray[$attributeName[0]]);
									break;
								default:
									//not supports!
									break;
							}
						}
						break;
					case self::INPUTSYSTEM_SPECIAL :
						$specialNode = $doc->createElement(self::INPUTSYSTEM_SPECIAL);
						$rootNode->appendChild($specialNode) ;
						$specialNode->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:palaso',self::XML_NAMESPACE_PALASO);

						foreach ($fieldProperty as $specailChildKey => $specailChild) {
							$specailChildArray = (array)$specailChild;
							$attributeName = array_keys($specailChildArray);

							$searchResult = array_search("value", $attributeName);
							if ($searchResult===FALSE){
								continue;
							}
							$attributeValue = (array)$specailChildArray[$attributeName[$searchResult]];
							$newPreprotyNode = $doc->createElementNS(self::XML_NAMESPACE_PALASO, $specailChildKey);
							$newPreprotyNode->setAttribute($attributeName[$searchResult], $attributeValue[0]);
							$specialNode->appendChild($newPreprotyNode);
								
						}

						break;
					default:
						//not supports!
						break;
				}
			}
			return $doc->saveXML();
		}
		return FALSE;
	}

	public static function encodeInputSystemXmlToJson($doc)
	{
		if ($doc->childNodes && $doc->childNodes->item(0)->nodeName==="ldml") {
			//top node is Fields, so drop it
			$child= $doc->childNodes->item(0);
			$ldml = array();
			foreach ($child->childNodes as $propertyChild) {
				$ldmlAttributes =array();
				switch ($propertyChild->nodeName) {
					case self::INPUTSYSTEM_COLLATIONS :
						if ($propertyChild->hasChildNodes())
						{
							$collationsNode = array();
							$collationSubNode = array();
							foreach ($propertyChild->childNodes as $collationChild) {
								$collationElement = array();
								foreach ($collationChild->childNodes as $collationSubChild) {
									switch ($collationSubChild->nodeName) {
										case self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE:
											if ($collationSubChild->hasChildNodes() && $collationSubChild->childNodes->item(0)->nodeName==="alias")
											{
												$aliasNode = $collationSubChild->childNodes->item(0);
												if ($aliasNode->hasAttribute("source"))
												{
													$collationElement[self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE ]=
													array (self::INPUTSYSTEM_COLLATIONS_COLLATION_BASE_ALIAS =>
													array ("source" => $aliasNode->getAttribute("source")));
												}
											}
											break;
										case self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL:
											foreach ($collationSubChild->getElementsByTagNameNS(self::XML_NAMESPACE_PALASO, '*') as $specailChild) {
												$collationSpecailxmlnsElement = array();
												$specailNode = array();
												switch ($specailChild->localName) {
													case self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL_PALASO_SORTRULESTYPE:
														$specailNode = array();
														$specailNode["@xmlns"] = array ($specailChild->prefix => $specailChild->namespaceURI);

														$collationSpecailxmlnsElement["@xmlns"] = array ($specailChild->prefix => $specailChild->namespaceURI);
														if ($specailChild->hasAttribute("value"))
														{
															$collationSpecailxmlnsElement["value"] = $specailChild->getAttribute("value") ;
														}else{
															$collationSpecailxmlnsElement["value"] = "";
														}
														break;
													default:
														//not supports!
														break;
												}
												$specailNode[$specailChild->prefix.":".$specailChild->localName] = $collationSpecailxmlnsElement;
												$collationElement[self::INPUTSYSTEM_COLLATIONS_COLLATION_SPECIAL] =$specailNode;
											}
											break;
										default:
											//not supports!
											break;
									}

								}
								$collationSubNode[]=$collationElement;
							}
							$ldmlAttributes["collation"] = $collationSubNode;
						}
						break;

					case self::INPUTSYSTEM_IDENTITY:
						if ($propertyChild->hasChildNodes())
						{
							$identity = array();
							foreach ($propertyChild->childNodes as $identityChild) {
								switch ($identityChild->nodeName) {
									case self::INPUTSYSTEM_IDENTITY_GENERATION:
										if ($identityChild->hasAttribute("date"))
										{
											$identity[self::INPUTSYSTEM_IDENTITY_GENERATION] = array("date" => $identityChild->getAttribute("date"));
										}else{
											$identity[self::INPUTSYSTEM_IDENTITY_GENERATION] = array("date" => "");
										}
										break;
									case self::INPUTSYSTEM_IDENTITY_LANGUAGE:
										if ($identityChild->hasAttribute("type"))
										{
											$identity[self::INPUTSYSTEM_IDENTITY_LANGUAGE] = array("type" => $identityChild->getAttribute("type"));
										}else{
											$identity[self::INPUTSYSTEM_IDENTITY_LANGUAGE] = array("type" => "");
										}
										break;
									case self::INPUTSYSTEM_IDENTITY_SCRIPT:
										if ($identityChild->hasAttribute("type"))
										{
											$identity[self::INPUTSYSTEM_IDENTITY_SCRIPT] = array("type" => $identityChild->getAttribute("type"));
										}else{
											$identity[self::INPUTSYSTEM_IDENTITY_SCRIPT] = array("type" => "");
										}
										break;
									case self::INPUTSYSTEM_IDENTITY_TERRITORY:
										if ($identityChild->hasAttribute("type"))
										{
											$identity[self::INPUTSYSTEM_IDENTITY_TERRITORY] = array("type" => $identityChild->getAttribute("type"));
										}else{
											$identity[self::INPUTSYSTEM_IDENTITY_TERRITORY] = array("type" => "");
										}
										break;
									case self::INPUTSYSTEM_IDENTITY_VARIANT:
										if ($identityChild->hasAttribute("type"))
										{
											$identity[self::INPUTSYSTEM_IDENTITY_VARIANT] = array("type" => $identityChild->getAttribute("type"));
										}else{
											$identity[self::INPUTSYSTEM_IDENTITY_VARIANT] = array("type" => "");
										}
										break;
									case self::INPUTSYSTEM_IDENTITY_VERSION:
										if ($identityChild->hasAttribute("number"))
										{
											$identity[self::INPUTSYSTEM_IDENTITY_VERSION] = array("number" => $identityChild->getAttribute("number"));
										}else{
											$identity[self::INPUTSYSTEM_IDENTITY_VERSION] = array("number" => "");
										}
										break;
									default:
										//not supports!
										break;
								}

							}
							$ldmlAttributes = $identity;
						}else{
							$ldmlAttributes = array();
						}
						break;

					case self::INPUTSYSTEM_SPECIAL:
						$specail = array();
						foreach ($propertyChild->getElementsByTagNameNS(self::XML_NAMESPACE_PALASO, '*') as $specailChild) {
							$specailxmlnsElement = array();
							switch ($specailChild->localName) {
								case self::INPUTSYSTEM_SPECIAL_PALASO_ABBREVIATION:
								case self::INPUTSYSTEM_SPECIAL_PALASO_LANGUAGENAME:
								case self::INPUTSYSTEM_SPECIAL_PALASO_VERSION:
								case self::INPUTSYSTEM_SPECIAL_PALASO_DEFAULTFONTFAMILY:
								case self::INPUTSYSTEM_SPECIAL_PALASO_DEFAULTFONTSIZE:
									$specailxmlnsElement["@xmlns"] = array ($specailChild->prefix => $specailChild->namespaceURI);
									if ($specailChild->hasAttribute("value"))
									{
										$specailxmlnsElement["value"] = $specailChild->getAttribute("value") ;
									}else{
										$specailxmlnsElement["value"] = "";
									}
									$specail[$specailChild->prefix.":".$specailChild->localName] = $specailxmlnsElement;
									break;
								default:
									//not supports!
									break;
							}
						}
						$ldmlAttributes = $specail;
						break;
					default:
						//not supports!
						break;
				}
				$ldml[$propertyChild->nodeName]= $ldmlAttributes;
			}

		}

		$result =  array(
			 					"ldml" => $ldml
		);
		return $result;
	}

};

?>