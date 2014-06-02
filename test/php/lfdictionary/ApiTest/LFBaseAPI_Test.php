<?php

/**
 * Test the LFBaseAPI.php functions.
 * 
 * @author Hugh
 */

use lfbase\common\DataConnector;

use lfbase\common\DataConnection;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(LF_BASE_PATH . "Loader.php");
require_once(SIMPLETEST_PATH . 'autorun.php');

// random user id (the user must exist)
//define('GENERAL_UID', 59);
define('GENERAL_UID', getRandomUid());
// echo "User id: " . GENERAL_UID . "<br />";

// random project id (the project must exist)
define('PROJECT_NID', getRandomProjectNid());
// echo "Project id: " . PROJECT_NID;

feedTheLoader();

class TestLFBaseAPI extends UnitTestCase {
	/**
	 * Test the LFBaseAPI function getUserFieldsSetting()
	 * 
	 * This test simply checks to see that fieldName has a value,
	 * visibility has a value, and the enabled setting is true.  This 
	 * is done for every setting returned for a particular user.  When
	 * writing this the random user selected had 15 settings, though I don't 
	 * know whether this is typical.
	 */
	function testGetUserFieldsSetting() {

 		$api = new LFBaseAPI(PROJECT_NID, GENERAL_UID);

		$setting = $api->getUserFieldsSetting(GENERAL_UID);
		
		$fieldSettings = new FieldSettings($setting);
		$settings = $fieldSettings->get();
		foreach ($settings as $setting) {
			$this->assertNotEqual($setting->fieldName(), '');
			$this->assertNotEqual($setting->visibility(), '');
			$this->assertTrue($setting->enabled());
		}
  }

  /**
   * Test the LFBaseAPI function getUserTasksSetting()
   * 
   * Only the taskName setting is checked, and only to make sure it has a value.  This
   * at least protects us from catastrophic failure of the tasks settings code.
   */
  function testGetUserTasksSetting() {
  	$api = new LFBaseAPI(PROJECT_NID, GENERAL_UID);
  
  	$setting = $api->getUserTasksSetting(GENERAL_UID);
  	
  	$taskSettings = new TaskSettings($setting);
  	$settings = $taskSettings->get();
  	foreach ($settings as $setting) {
  		$this->assertNotEqual($setting->taskName(), '');
  	}
  }

  /**
   * Test the LFBaseAPI function getSettingInputSystems()
   * 
   * This simply tests that the first two characters of each of the language fields (e.g. "en")
   * match the first two characters of each of the palasoAbbreviation fields (e.g. "eng").  This
   * is a bit of an arbitrary test, but it does ensure that if the code or structure changes
   * without us realising, we should instantly find out.
   */
  function testGetSettingInputSystems() {
  	$api = new LFBaseAPI(PROJECT_NID, GENERAL_UID);
  	
  	$rawInputSystems = $api->getSettingInputSystems();
  	$inputSystems = new InputSystems($rawInputSystems);
  	$ldmls = $inputSystems->get();
 	  foreach ($ldmls as $ldml) {
 	  	$this->assertEqual(substr($ldml->getLanguage(), 0, 2),  substr($ldml->getPalasoAbbreviation(), 0, 2));
 	  }
  }
}

/**
 * Model the input systems
 */
class InputSystems {
	// An array of individual LDML (Locale Data Markup Language) objects
	private $ldmls;

	function __construct($rawSystems) {
		// The array passed in is supplied in the format:
		//   $rawSettings['list']['0']['ldml']
		//   $rawSettings['list']['1']['ldml']
		$items = $rawSystems['list'];
		foreach ($items as $rawSystem) {
			// Convert to a genuine Ldml object
			$ldml = new Ldml($rawSystem);

			$this->ldmls[] = $ldml;
		}
	}

	/**
	 * Return an array of FieldSetting objects
	 */
	function get() {
		return $this->ldmls;
	}
}

/**
 * Model the LDML (Locale Data Markup Language) Object
 */
class Ldml {
	private $language;
	private $palasoAbbreviation;
	
	/**
	 * The raw data has the structure including:
	 * ['ldml']['identity']['version']['number']
	 * ['ldml']['identity']['generation']['date']
	 * ['ldml']['identity']['language']['type']
	 * 
	 * ['ldml']['special']['palaso:abbreviation']['value']
	 */
	function __construct($rawLdml) {
		$this->language = $rawLdml['ldml']['identity']['language']['type'];
		$this->palasoAbbreviation = $rawLdml['ldml']['special']['palaso:abbreviation']['value'];
	}
	
	function getLanguage() {
		return $this->language;
	}
	
	function getPalasoAbbreviation() {
		return $this->palasoAbbreviation;
	}
}

/**
 * Model the task settings
 *
 * Settings are a collection of individual Setting items.
 */
class TaskSettings {
	// An array of individual TaskSetting objects
	private $settings;

	function __construct($rawSettings) {
		// The array passed in is supplied in the format:
		//   $rawSettings['tasks']['task']['0']['className']
		//   $rawSettings['tasks']['task']['0']['dataType']
		//   ...
		//   $rawSettings['tasks']['task']['1']['className']
		//   etc.
		// We convert each of the array items into real
		// settings objects and store these as an array

		// Get the actual array of (say) 15 task items
		$taskItems = $rawSettings['tasks']['task'];
		foreach ($taskItems as $rawSetting) {
			// Convert to a genuine FieldSetting object
			$setting = new TaskSetting($rawSetting);
				
			$this->settings[] = $setting;
		}
	}

	/**
	 * Return an array of FieldSetting objects
	 */
	function get() {
		return $this->settings;
	}
}

/**
 * Model a single task setting item.
 *
 * A setting item can have values like taskName, visibible.
 */
class TaskSetting {
	private $taskName;
	private $visible;

	function __construct($settingArray) {
		// The tasks are in a weird BadgerFish format where each
		// element is in a single item array with '$' as the key
		$this->setTaskName($settingArray['taskName']);
		$this->visible = $settingArray['visible'];
	}

	/**
	 * Set the taskName, e.g. 'AddMissingInfo', 'GatherWordList'
	 */
	function setTaskName($taskName) {
		$taskNames = array(
				'AddMissingInfo', 'Dashboard', 'Dictionary', 'AdvancedHistory',
				'NotesBrowser', 'GatherWordList', 'GatherWordsBySemanticDomains',
				'ConfigureSettings');

		if (in_array($taskName, $taskNames)) {
			$this->taskName = $taskName;
		}
		else {
			$this->taskName = "[Invalid taskName]";

			error_log("Invalid taskName: " . $taskName);
			exit("Invalid taskName: " . $taskName);
		}
	}


	/**
	 * Get the taskName value, e.g. "AddMissingInfo"
	 */
	function taskName() {
		return $this->taskName;
	}

	/**
	 * Get the visible state, either TRUE or FALSE
	 */
	function visible() {
		return $this->visible;
	}
}

/**
 * Model the field settings
 * 
 * Settings are a collection of individual Setting items.
 */
class FieldSettings {
	// An array of individual FieldSetting objects
	private $settings;
	
	function __construct($rawSettings) {
		// The array passed in is supplied in the format:
		//   $rawSettings['fields']['field']['0']['className']
		//   $rawSettings['fields']['field']['0']['dataType']
		//   ...
		//   $rawSettings['fields']['field']['1']['className']
		//   etc.
		// We convert each of the array items into real
		// settings objects and store these as an array
		
		// Get the actual array of (say) 15 field items
		$fieldItems = $rawSettings['fields']['field'];
		foreach ($fieldItems as $rawSetting) {
			// Convert to a genuine FieldSetting object
			$setting = new FieldSetting($rawSetting);
			
			$this->settings[] = $setting;
		}
  }	
  
  /**
   * Return an array of FieldSetting objects
   */
  function get() {
  	return $this->settings;
  }
}

/**
 * Model a single field setting item.
 * 
 * A setting item can have values like fieldName, enabled and visibility.
 */
class FieldSetting {
	private $fieldName;
	private $enabled;
	private $visibility;
	
	function __construct($settingArray) {
		// The fields are in a weird BadgerFish format where each
		// element is in a single item array with '$' as the key
		$this->setfieldName($settingArray['fieldName']['$']);
		$this->enabled = $settingArray['enabled']['$'];
		$this->setVisibility($settingArray['visibility']['$']);
	}
	
	/**
	 * Set the fieldName, e.g. 'EntryLexicalForm', 'citation'
	 */
	function setfieldName($fieldName) {
		$fieldNames = array(
				'EntryLexicalForm', 'citation', 'definition', 'NewDefinition', 
				'gloss', 'literal-meaning', 'note', 'Picture', 'POS', 'ExampleSentence',
				'NewExampleSentence', 'ExampleTranslation', 'semantic-domain-ddp4', 
				'BaseForm', 'confer');
				
		if (in_array($fieldName, $fieldNames)) {
			$this->fieldName = $fieldName;
		}
		else {
			$this->fieldName = "[Invalid fieldName]";
	
			error_log("Invalid fieldName: " . $fieldName);
		}
	}
	
	/**
	 * Set the visibility, e.g. 'Visible', 'NormallyHidden'
	 */
	function setVisibility($visibility) {
		$visibilities = array('Visible', 'NormallyHidden');
		if (in_array($visibility, $visibilities)) {
			$this->visibility = $visibility;
		}
		else {
			$this->visibility = "";
						
			error_log("Invalid visibility: " . $visibility);
		}
	}
	
	/**
	 * Get the fieldName value
	 * 
	 * A fieldName will be something like "EntryLexicalForm" or "citation".
	 */
	function fieldName() {
		return $this->fieldName;
	}
	
	/**
	 * Get the visibility
	 * 
	 * @return visibilty is one of:
	 * 	'Visible'
	 *  'NormallyHidden'
	 */
	function visibility() {
		return $this->visibility;
	}
	
	/**
	 * Get the enabled state, either TRUE or FALSE
	 */
	function enabled() {
		return $this->enabled;
	}
}

/**
 * Get a random user id
 */
function getRandomUid() {
	global $db;
	$result = $db->execute("SELECT uid FROM users ORDER BY RAND() LIMIT 1");
// 	$result = mysql_query("SELECT uid FROM users ORDER BY RAND() LIMIT 1");
	
// 	$row = mysql_fetch_assoc($result);
	$row = $db->fetchrow($result);
		
	return $row['uid'];
}

/**
 * Get a random project id
 */
function getRandomProjectNid() {
	global $db;
	$result = $db->execute("SELECT nid FROM node WHERE type = 'project' ORDER BY RAND() LIMIT 1");
	$row = $db->fetchrow($result);
	return $row['nid'];
}

/**
 * The Loader is a highly annoying thing which is designed to drive people debugging nuts.
 * In order to reduce the effect, during testing, the Loader can be pre-fed, by
 * giving it all the things which it might want.  That way, whilst debugging, it will not get in
 * the way of a pleasant and productive debug session.
 * 
 * Add to this function any objects which the Loader might want to load in this file
 */
function feedTheLoader() {
	
}
