<?php

use \libraries\lfdictionary\dto\DomainQuestionDTO;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfDomainQuestionDTO extends UnitTestCase {

	function testDomainQuestionDTO_Encode_JsonCorrect() {
		$dto = new DomainQuestionDTO();
		$dto->addExampleSentences("Description");
		$dto->addExampleWords("Description");
		$dto->addQuestions("Description");
		$dto->setDescription("Description");
		$dto->setGuid("Guid");
		$result = json_encode($dto->encode());
		
		$this->assertEqual($result, '{"guid":"Guid","description":"Description","questions":["Description"],"exampleWords":["Description"],"exampleSentences":["Description"]}');
	}

}

?>