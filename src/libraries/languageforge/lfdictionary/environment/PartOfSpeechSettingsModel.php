<?php
/**
 * This Class defines the Project required Information.
 * LanguageForge Dictionary API
 * @author Arivusudar
 */
namespace libraries\lfdictionary\environment;

class PartOfSpeechSettingsModel
{

	function encode() {
		return array(
			array("value" => "Select", "id" => "0"),
			array("value" => "Noun", "id" => "1"),
			array("value" => "Verb", "id" => "2"),
			array("value" => "Adjective", "id" => "3"),
			array("value" => "Adverb", "id" => "4")
		);
	}

}

?>