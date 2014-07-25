<?php

namespace models\languageforge\lexicon;

use libraries\shared\palaso\CodeGuard;
use models\mapper\Id;
use models\mapper\ArrayOf;
use models\ProjectModel;

class LexEntryModel extends \models\mapper\MapperModel {

	public static function mapper($databaseName) {
		static $instance = null;
		if (null === $instance) {
			$instance = new \models\mapper\MongoMapper($databaseName, 'lexicon');
		}
		return $instance;
	}

	/**
	 * @param ProjectModel $projectModel
	 * @param string $id
	 */
	public function __construct($projectModel, $id = '') {
		$this->setPrivateProp('guid');
		$this->setPrivateProp('mercurialSha');
		$this->setReadOnlyProp('authorInfo');
		$this->id = new Id();
		$this->lexeme = new MultiText();
		$this->senses = new ArrayOf(
			function($data) {
				return new Sense();
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



		$this->citationForm = new MultiText();
		$this->environments = new LexiconMultiValueField();
		$this->pronunciation = new MultiText();
		$this->cvPattern = new MultiText();
		$this->location = new LexiconField();
		$this->etymology = new MultiText();
		$this->etymologyGloss = new MultiText();
		$this->etymologyComment = new MultiText();
		$this->etymologySource = new MultiText();
		$this->note = new MultiText();
		$this->literalMeaning = new MultiText();
		$this->entryBibliography = new MultiText();
		$this->entryRestrictions = new MultiText();
		$this->summaryDefinition = new MultiText();
		$this->entryImportResidue = new MultiText();



		$databaseName = $projectModel->databaseName();
		parent::__construct(self::mapper($databaseName), $id);
	}
	
	/**
	 * @var IdReference
	 */
	public $id;
	
	/**
	 * 
	 * @var string
	 */
	public $guid;

	/**
	 *
	 * @var string
	 */
	public $mercurialSha;

	/**
	 * @var MultiText
	 */
	// TODO Renamed $_entry to $lexeme.  References to $_entry may still exist
	public $lexeme; 
	
	/**
	 * @var ArrayOf ArrayOf<Sense>
	 */
	public $senses;
	
	/**
	 * @var ArrayOf <>
	 */
	public $customFields;

	/**
	 *
	 * @var AuthorInfo
	 */
	 // TODO Renamed $_metadata to $authorInfo, remove this comment when stitched in IJH 2013-11
	public $authorInfo;

	/**
	 * If the $value of $propertyName exists in senses return the index
	 * @param string $senseId
	 * @param array $senses
	 * @return array <$index or -1 if not found>
	 */
	public function searchSensesFor($propertyName, $value) {
		foreach ($this->senses as $index => $sense) {
 			if (isset($sense->{$propertyName}) && (trim($sense->{$propertyName}) !== '') && ($sense->{$propertyName} == $value)) {
				return $index;
			}
		}
		return -1;
	}
	
	/**
	 * 
	 * @param string $id
	 * @return Sense
	 */
	public function getSense($id) {
		foreach ($this->senses as $sense) {
			if ($sense->id == $id) {
				return $sense;
			}
		}
	}

	/**
	 * 
	 * @param string $id
	 * @param Sense $model
	 */
	public function setSense($id, $model) {
		foreach ($this->senses as $key => $sense) {
			if ($sense->id == $id) {
				$this->senses[$key] = $model;
				break;
			}
		}
	}

	
	/**
	 * Remove this LexEntry from the collection
	 * @param ProjectModel $projectModel
	 * @param string $id
	 */
	public static function remove($projectModel, $id) {
		$databaseName = $projectModel->databaseName();
		self::mapper($databaseName)->remove($id);
	}






	// Less common fields used in FLEx

	/**
	 * @var MultiText
	 */
	public $citationForm;

	/**
	 * @var LexiconMultiValueField
	 */
	public $environments;

	/**
	 * @var MultiText
	 */
	public $pronunciation;

	/**
	 * @var MultiText
	 */
	public $cvPattern;

	/**
	 * @var MultiText
	 */
	public $tone;

	/**
	 * @var LexiconField
	 */
	public $location;

	/**
	 * @var MultiText
	 */
	public $etymology;

	/**
	 * @var MultiText
	 */
	public $etymologyGloss;

	/**
	 * @var MultiText
	 */
	public $etymologyComment;

	/**
	 * @var MultiText
	 */
	public $etymologySource;

	/**
	 * @var MultiText
	 */
	public $note;

	/**
	 * @var MultiText
	 */
	public $literalMeaning;

	/**
	 * @var MultiText
	 */
	public $entryBibliography;

	/**
	 * @var MultiText
	 */
	public $entryRestrictions;

	/**
	 * @var MultiText
	 */
	public $summaryDefinition;

	/**
	 * @var MultiText
	 */
	public $entryImportResidue;

}


?>
