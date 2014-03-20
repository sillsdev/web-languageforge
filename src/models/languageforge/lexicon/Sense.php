<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class Sense {

	function __construct($liftId = '') {
		$this->liftId = $liftId;
		$this->id = uniqid();
		$this->definition = new MultiText();
		$this->partOfSpeech = new LexiconFieldWithComments();
		$this->semanticDomain = new LexiconMultiValueFieldWithComments();
		$this->examples = new ArrayOf(
			function($data) {
				return new Example();
			}
		);
		$this->authorInfo = new AuthorInfo();
	}

	/**
	 * The id of the sense as specified in the LIFT file
	 * @var string
	 */
	public $liftId;
	
	public $id;

	/**
	 * @var MultiText
	 */
	public $definition;
	
	/**
	 * @var LexiconFieldWithComments
	 */
	public $partOfSpeech;
	

	/**
	 * @var LexiconMultiValueFieldWithComments
	 */
	public $semanticDomain;

	/**
	 * @var ArrayOf<Example>
	 */
	public $examples;

	/**
	 *
	 * @var AuthorInfo
	 */
	public $authorInfo;
	
	
	/**
	 * 
	 * @param string $id
	 * @return Example
	 */
	public function getExample($id) {
		foreach ($this->examples as $example) {
			if ($example->id == $id) {
				return $example;
			}
		}
	}

	/**
	 * 
	 * @param string $id
	 * @param Example $model
	 */
	public function setExample($id, $model) {
		foreach ($this->examples as $key => $example) {
			if ($example->id == $id) {
				$this->examples[$key] = $model;
				break;
			}
		}
	}
	
}

?>
