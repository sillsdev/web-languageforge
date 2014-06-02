<?php
namespace libraries\lfdictionary\dto;

// TODO Refactor. Conflate with the similarly named command which should be the dto. The encdoing should become trivial with JsonEncoder CP 2013-12
class DomainQuestionDTO{

	/**
	 * @var String
	 */
	var $_domainGuid;

	/**
	 * @var String
	 */
	var $_domainDescription;

	/**
	 * @var Array<String>
	 */
	var $_domainQuestion;

	/**
	 * @var Array<String>
	 */
	var $_domainExampleWords;

	/**
	 * @var Array<String>
	 */
	var $_domainExampleSentences;


	function __construct(){
		$this->_domainQuestion = array();
		$this->_domainExampleWords = array();
		$this->_domainExampleSentences = array();
	}


	function setGuid($guid){
		$this->_domainGuid = $guid;
	}

	function setDescription($description){
		$this->_domainDescription = $description;
	}

	function addQuestions($question){
		$this->_domainQuestion[] = $question;
	}

	function addExampleWords($exampleWord){
		$this->_domainExampleWords[] = $exampleWord;
	}

	function addExampleSentences($exampleSentences){
		$this->_domainExampleSentences[] = $exampleSentences;
	}


	function encode(){
		return array("guid" => $this->_domainGuid,
					 "description" => $this->_domainDescription,
					 "questions" => $this->_domainQuestion,
					 "exampleWords" => $this->_domainExampleWords,
					 "exampleSentences" => $this->_domainExampleSentences);
	}

}