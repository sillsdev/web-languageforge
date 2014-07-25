<?php

namespace models\languageforge\lexicon;

use libraries\shared\palaso\CodeGuard;
use models\mapper\ArrayOf;

class Sense {

	function __construct($liftId = '') {
		$this->liftId = $liftId;
		$this->id = uniqid();
		$this->definition = new MultiText();
		$this->gloss = new MultiText();
		$this->partOfSpeech = new LexiconField();
		$this->semanticDomain = new LexiconMultiValueField();
		$this->examples = new ArrayOf(
			function($data) {
				return new Example();
			}
		);
		$this->customFields = new ArrayOf(
			function($data) {
				CodeGuard::checkTypeAndThrow($data, 'array');
				if (array_key_exists('value', $data)) {
					return new LexiconField();
				} elseif (array_key_exists('values', $data)) {
					return new LexiconMultiValueField();
				} else {
					return new MultiText();
				}
			}
		);
		$this->authorInfo = new AuthorInfo();



		$this->scientificName = new MultiText();
		$this->anthropologyNote = new MultiText();
		$this->senseBibliography = new MultiText();
		$this->discourseNote = new MultiText();
		$this->encyclopedicNote = new MultiText();
		$this->generalNote = new MultiText();
		$this->grammarNote = new MultiText();
		$this->phonologyNote = new MultiText();
		$this->senseRestrictions = new MultiText();
		$this->semanticsNote = new MultiText();
		$this->sociolinguisticsNote = new MultiText();
		$this->source = new MultiText();
		$this->usages = new LexiconMultiValueField();

		// TODO reversalEntries needs to be a Taglist 07-2014 DDW
		$this->reversalEntries = new LexiconMultiValueField();
		$this->senseType = new LexiconField();
		$this->academicDomains = new LexiconMultiValueField();
		$this->sensePublishIn = new LexiconMultiValueField();
		$this->anthropologyCategories = new LexiconMultiValueField();
		$this->senseImportResidue = new MultiText();
		$this->status = new LexiconMultiValueField();



	}

	/**
	 * The id of the sense as specified in the LIFT file
	 * @var string
	 */
	public $liftId;
	
	/**
	 * uniqid
	 * @var string
	 */
	public $id;

	/**
	 * @var MultiText
	 */
	public $definition;
	
	/**
	 * @var MultiText
	 */
	public $gloss;
	
	/**
	 * @var LexiconField
	 */
	public $partOfSpeech;
	

	/**
	 * @var LexiconMultiValueField
	 */
	public $semanticDomain;

	/**
	 * @var ArrayOf<Example>
	 */
	public $examples;

	/**
	 * @var ArrayOf <>
	 */
	public $customFields;

	/**
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



	// less common fields used in FLEx

	/**
	 * @var MultiText
	 */
	public $scientificName;

	/**
	 * @var MultiText
	 */
	public $anthropologyNote;

	/**
	 * @var MultiText
	 */
	public $senseBibliography;

	/**
	 * @var MultiText
	 */
	public $discourseNote;

	/**
	 * @var MultiText
	 */
	public $encyclopedicNote;

	/**
	 * @var MultiText
	 */
	public $generalNote;

	/**
	 * @var MultiText
	 */
	public $grammarNote;

	/**
	 * @var MultiText
	 */
	public $phonologyNote;

	/**
	 * @var MultiText
	 */
	public $senseRestrictions;

	/**
	 * @var MultiText
	 */
	public $semanticsNote;

	/**
	 * @var MultiText
	 */
	public $sociolinguisticsNote;

	/**
	 * @var MultiText
	 */
	public $source;

	/**
	 * @var LexiconMultiValueField
	 */
	public $usages;

	// TODO 07-2014 DDW make this Taglist
	/**
	 * @var Taglist
	 */
	public $reversalEntries;

	/**
	 * @var LexiconField
	 */
	public $senseType;

	/**
	 * @var LexiconMultiValueField
	 */
	public $academicDomains;

	/**
	 * @var LexiconMultiValueField
	 */
	public $sensePublishIn;

	/**
	 * @var LexiconMultiValueField
	 */
	public $anthropologyCategories;

	/**
	 * @var MultiText
	 */
	public $senseImportResidue;

	/**
	 * @var LexiconMultiValueField
	 */
	public $status;


}

?>
