<?php
use libraries\lfdictionary\commands\GetSettingUserTasksSettingCommand;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(dirname(__FILE__) . '/../MockObject/LexProjectMockObject.php');

class GetSettingUserTasksSettingCommand_Test extends UnitTestCase {

	private $FINAL_RESULT="{\"tasks\":{\"task\":[{\"taskName\":\"Dashboard\",\"visible\":\"true\",\"index\":\"1\"},{\"taskName\":\"Dictionary\",\"visible\":\"true\",\"index\":\"2\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Meanings\"},\"longLabel\":{\"$\":\"Add Meanings\"},\"description\":{\"$\":\"Add meanings (senses) to entries where they are missing.\"},\"field\":{\"$\":\"definition\"},\"showFields\":{\"$\":\"definition\"},\"readOnly\":{\"$\":\"semantic-domain-ddp4\"},\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"3\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Parts of Speech\"},\"longLabel\":{\"$\":\"Add Parts of Speech\"},\"description\":{\"$\":\"Add parts of speech to senses where they are missing.\"},\"field\":{\"$\":\"POS\"},\"showFields\":{\"$\":\"POS\"},\"readOnly\":{\"$\":\"definition, ExampleSentence\"},\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"4\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Example Sentences\"},\"longLabel\":{\"$\":\"Add Example Sentences\"},\"description\":{\"$\":\"Add example sentences to senses where they are missing.\"},\"field\":{\"$\":\"ExampleSentence\"},\"showFields\":{\"$\":\"ExampleSentence\"},\"readOnly\":{\"$\":\"definition\"},\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"5\"},{\"taskName\":\"AddMissingInfo\",\"visible\":\"false\",\"label\":{\"$\":\"Base Forms\"},\"longLabel\":{\"$\":\"Add Base Forms\"},\"description\":{\"$\":\"Identify the \\\"base form\\\" word that this word is built from. In the printed dictionary, the derived or variant words can optionally be shown as subentries of their base forms.\"},\"field\":{\"$\":\"BaseForm\"},\"showFields\":{\"$\":\"BaseForm\"},\"readOnly\":[],\"writingSystemsToMatch\":[],\"writingSystemsWhichAreRequired\":[],\"index\":\"6\"},{\"taskName\":\"AdvancedHistory\",\"visible\":\"false\",\"index\":\"7\"},{\"taskName\":\"NotesBrowser\",\"visible\":\"false\",\"index\":\"8\"},{\"taskName\":\"GatherWordList\",\"visible\":\"false\",\"wordListFileName\":{\"$\":\"SILCAWL\"},\"wordListWritingSystemId\":{\"$\":\"en\"},\"index\":\"9\"},{\"taskName\":\"GatherWordList\",\"visible\":\"false\",\"wordListFileName\":{\"$\":\"SILCAWL-MozambiqueAddendum\"},\"wordListWritingSystemId\":{\"$\":\"en\"},\"index\":\"10\"},{\"taskName\":\"GatherWordsBySemanticDomains\",\"visible\":\"true\",\"semanticDomainsQuestionFileName\":{\"$\":\"Ddp4Questions-en.xml\"},\"showMeaningField\":{\"$\":\"False\"},\"index\":\"11\"}]}}";
	
	function testGetSettingUserFieldsSettingCommand_MutilEntries() {
		// a exists user profile
		$command = new GetSettingUserTasksSettingCommand(new LexProjectMockObject(),"user1");
		$result = $command->execute();
		$this->assertEqual(count($result["tasks"]["task"]), 11);
		$this->assertEqual(json_encode($result),$this->FINAL_RESULT);
		// not exists user profile, use system default
		//$command = new GetSettingUserTasksSettingCommand(new LexProjectMockObject(),"blahblah");
		//$result = $command->execute();
		//$this->assertEqual(count($result["tasks"]["task"]), 11);
		//$this->assertEqual(json_encode($result),$this->FINAL_RESULT);
	}
}

?>