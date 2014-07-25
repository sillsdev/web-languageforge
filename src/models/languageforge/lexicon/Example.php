<?php

namespace models\languageforge\lexicon;

use libraries\shared\palaso\CodeGuard;
use models\mapper\ArrayOf;
use models\mapper\ObjectForEncoding;

class Example extends ObjectForEncoding {

	function __construct($liftId = '') {
		$this->setPrivateProp('liftId');
		$this->setReadOnlyProp('authorInfo');
		$this->liftId = $liftId;
		$this->sentence = new MultiText();
		$this->translation = new MultiText();
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



		$this->reference = new MultiText();
		$this->examplePublishIn = new LexiconMultiValueField();



		$this->id = uniqid();
	}

	/**
	 * The id of the example as specified in the LIFT file
	 * @var string
	 */
	public $liftId;

	/**
	 * @var MultiText
	 */
	public $sentence;
	
	/**
	 * @var MultiText
	 */
	public $translation;

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
	 * @var string
	 */
	public $id;



	// less common fields used in FLEx

	/**
	 * @var MultiText
	 */
	public $reference;

	/**
	 * @var LexiconMultiValueField
	 */
	public $examplePublishIn;

}

?>
