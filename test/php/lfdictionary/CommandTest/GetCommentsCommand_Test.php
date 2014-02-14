<?php
use libraries\lfdictionary\commands\GetCommentsCommand;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class TestOfGetCommentsCommand extends UnitTestCase {

	private $FINAL_RESULT_ALL= "{\"entries\":[{\"conclass\":\"question\",\"guid\":\"f6bf16f0-b633-48f1-8125-f2b7fb69df2d\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"dca37623-3f8a-45f3-8d53-5728205ad37c\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203041,\"comment\":\"Not sure if the word is spelt correctly.\",\"status\":\"\",\"children\":[]},{\"conclass\":\"\",\"guid\":\"a6ab950a-233c-4d18-8363-19f647618dbc\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203283,\"comment\":\"Could be strange.\",\"status\":\"closed\",\"children\":[]}]},{\"conclass\":\"question\",\"guid\":\"dae563b1-8943-41b5-b8ba-7d175a9c09b9\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"1883a809-23be-4082-bf63-b026827a74c2\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203462,\"comment\":\"I've got another question.\",\"status\":\"\",\"children\":[]}]},{\"conclass\":\"question\",\"guid\":\"42af8a6d-060d-498c-a6d3-5aa150f7ea92\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"946669af-eb41-4fe4-98a3-d8d7eb6facfc\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203504,\"comment\":\"I think the example sentence really needs work too.\",\"status\":\"\",\"children\":[]}]},{\"conclass\":\"mergeConflict\",\"guid\":\"42af8a6d-060d-498c-a6d3-5ad150f7ea92\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"946669af-eb41-4fe4-98a3-d8d7eb6faaac\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203504,\"comment\":\"I think the example sentence really needs work too.\",\"status\":\"\",\"children\":[]}]}]}";
	
	private $FINAL_RESULT_ALL_QUESTION= "{\"entries\":[{\"conclass\":\"question\",\"guid\":\"f6bf16f0-b633-48f1-8125-f2b7fb69df2d\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"dca37623-3f8a-45f3-8d53-5728205ad37c\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203041,\"comment\":\"Not sure if the word is spelt correctly.\",\"status\":\"\",\"children\":[]},{\"conclass\":\"\",\"guid\":\"a6ab950a-233c-4d18-8363-19f647618dbc\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203283,\"comment\":\"Could be strange.\",\"status\":\"closed\",\"children\":[]}]},{\"conclass\":\"question\",\"guid\":\"dae563b1-8943-41b5-b8ba-7d175a9c09b9\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"1883a809-23be-4082-bf63-b026827a74c2\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203462,\"comment\":\"I've got another question.\",\"status\":\"\",\"children\":[]}]},{\"conclass\":\"question\",\"guid\":\"42af8a6d-060d-498c-a6d3-5aa150f7ea92\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"946669af-eb41-4fe4-98a3-d8d7eb6facfc\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203504,\"comment\":\"I think the example sentence really needs work too.\",\"status\":\"\",\"children\":[]}]}]}";
	
	private $FINAL_RESULT_ALL_MERGECONFLICT= "{\"entries\":[{\"conclass\":\"mergeConflict\",\"guid\":\"42af8a6d-060d-498c-a6d3-5ad150f7ea92\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"946669af-eb41-4fe4-98a3-d8d7eb6faaac\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203504,\"comment\":\"I think the example sentence really needs work too.\",\"status\":\"\",\"children\":[]}]}]}";
	
	private $FINAL_RESULT_FIRST= "{\"entries\":[{\"conclass\":\"question\",\"guid\":\"f6bf16f0-b633-48f1-8125-f2b7fb69df2d\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"dca37623-3f8a-45f3-8d53-5728205ad37c\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203041,\"comment\":\"Not sure if the word is spelt correctly.\",\"status\":\"\",\"children\":[]},{\"conclass\":\"\",\"guid\":\"a6ab950a-233c-4d18-8363-19f647618dbc\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203283,\"comment\":\"Could be strange.\",\"status\":\"closed\",\"children\":[]}]}]}";
	
	private $FINAL_RESULT_RECENT="{\"entries\":[{\"conclass\":\"mergeConflict\",\"guid\":\"42af8a6d-060d-498c-a6d3-5ad150f7ea92\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"946669af-eb41-4fe4-98a3-d8d7eb6faaac\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203504,\"comment\":\"I think the example sentence really needs work too.\",\"status\":\"\",\"children\":[]}]}]}";
	
	private $FINAL_RESULT_CLOSED="{\"entries\":[{\"conclass\":\"question\",\"guid\":\"f6bf16f0-b633-48f1-8125-f2b7fb69df2d\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"dca37623-3f8a-45f3-8d53-5728205ad37c\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203041,\"comment\":\"Not sure if the word is spelt correctly.\",\"status\":\"\",\"children\":[]},{\"conclass\":\"\",\"guid\":\"a6ab950a-233c-4d18-8363-19f647618dbc\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203283,\"comment\":\"Could be strange.\",\"status\":\"closed\",\"children\":[]}]}]}";
	
	private $FINAL_RESULT_UNCLOSED="{\"entries\":[{\"conclass\":\"question\",\"guid\":\"dae563b1-8943-41b5-b8ba-7d175a9c09b9\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"1883a809-23be-4082-bf63-b026827a74c2\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203462,\"comment\":\"I've got another question.\",\"status\":\"\",\"children\":[]}]},{\"conclass\":\"question\",\"guid\":\"42af8a6d-060d-498c-a6d3-5aa150f7ea92\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"946669af-eb41-4fe4-98a3-d8d7eb6facfc\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203504,\"comment\":\"I think the example sentence really needs work too.\",\"status\":\"\",\"children\":[]}]},{\"conclass\":\"mergeConflict\",\"guid\":\"42af8a6d-060d-498c-a6d3-5ad150f7ea92\",\"ref\":\"lift:\/\/Abadi.lift?type=entry&label=asdfa todayyyy&id=85aa75f5-a6bc-43cb-8c9b-cd5ce3513156\",\"author\":\"\",\"date\":\"\",\"comment\":\"\",\"status\":\"\",\"children\":[{\"conclass\":\"\",\"guid\":\"946669af-eb41-4fe4-98a3-d8d7eb6faaac\",\"ref\":\"\",\"author\":\"C\",\"date\":1338203504,\"comment\":\"I think the example sentence really needs work too.\",\"status\":\"\",\"children\":[]}]}]}";
	
	function testGetComments() {
		$chorusNotesFilePath= DicTestPath . "data/Test.lift.ChorusNotes";
		$commandAll_Not_Recent = new GetCommentsCommand($chorusNotesFilePath, "","", 0,999,false);
		$result = json_encode($commandAll_Not_Recent->execute()->encode());
		$this->assertEqual($this->FINAL_RESULT_ALL, $result);
		
		$chorusNotesFilePath= DicTestPath. "data/Test.lift.ChorusNotes";
		$commandAll_Question_Not_Recent = new GetCommentsCommand($chorusNotesFilePath, "","question", 0,999,false);
		$result = json_encode($commandAll_Question_Not_Recent->execute()->encode());
		$this->assertEqual($this->FINAL_RESULT_ALL_QUESTION, $result);
		
		$chorusNotesFilePath= DicTestPath. "data/Test.lift.ChorusNotes";
		$commandAll_mergeConflict_Not_Recent = new GetCommentsCommand($chorusNotesFilePath, "","mergeConflict", 0,999,false);
		$result = json_encode($commandAll_mergeConflict_Not_Recent->execute()->encode());
		$this->assertEqual($this->FINAL_RESULT_ALL_MERGECONFLICT, $result);
		
		$commandFirst_Not_Recent = new GetCommentsCommand($chorusNotesFilePath, "","", 0,1,false);
		$result = json_encode($commandFirst_Not_Recent->execute()->encode());
		$this->assertEqual($this->FINAL_RESULT_FIRST, $result);
		
		$commandRecent = new GetCommentsCommand($chorusNotesFilePath, "","", 0,1,true);
		$result = json_encode($commandRecent->execute()->encode());
		$this->assertEqual($this->FINAL_RESULT_RECENT, $result);
		
		$commandAll_Closed = new GetCommentsCommand($chorusNotesFilePath, "closed","", 0,999,false);
		$result = json_encode($commandAll_Closed->execute()->encode());
		$this->assertEqual($this->FINAL_RESULT_CLOSED, $result);
		
		$commandAll_Unclosed = new GetCommentsCommand($chorusNotesFilePath, "unclosed","", 0,999,false);
		$result = json_encode($commandAll_Unclosed->execute()->encode());
		$this->assertEqual($this->FINAL_RESULT_UNCLOSED, $result);
	}
}

?>