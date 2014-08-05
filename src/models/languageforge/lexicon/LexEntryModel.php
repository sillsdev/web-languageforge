<?php

namespace models\languageforge\lexicon;

use libraries\shared\palaso\CodeGuard;
use models\mapper\Id;
use models\mapper\ArrayOf;
use models\ProjectModel;

function _createSense($data) {
	return new Sense();
}

class LexEntryModel extends \models\mapper\MapperModel {

	use \LazyProperty\LazyPropertiesTrait;
	
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
		
		$this->initLazyProperties([
				'senses',
				'customFields',
				'authorInfo',
				'lexeme',
				'pronunciation',
				'cvPattern',
				'citationForm',
				'etymology',
				'etymologyGloss',
				'etymologyComment',
				'etymologySource',
				'note',
				'literalMeaning',
				'entryBibliography',
				'entryRestrictions',
				'summaryDefinition',
				'entryImportResidue',
				'tone',
				'environments',
				'location'
		], false);
		
        $this->isDeleted = false;
		
        $this->id = new Id();

		$databaseName = $projectModel->databaseName();
		parent::__construct(self::mapper($databaseName), $id);
	}
	
	protected function & createProperty($name) {
		switch ($name) {
			case 'senses':
				return new ArrayOf('models\languageforge\lexicon\_createSense');
			case 'customFields':
				return new ArrayOf('models\languageforge\lexicon\_createCustomField');
			case 'authorInfo':
				return new AuthorInfo();
			case 'lexeme':
			case 'pronunciation':
			case 'cvPattern':
			case 'citationForm':
			case 'etymology':
			case 'etymologyGloss':
			case 'etymologyComment':
			case 'etymologySource':
			case 'note':
			case 'literalMeaning':
			case 'entryBibliography':
			case 'entryRestrictions':
			case 'summaryDefinition':
			case 'entryImportResidue':
			case 'tone':
				return new MultiText();
			case 'environments':
				return new LexiconMultiValueField();
			case 'location':
				return new LexiconField();
				
		}
	}
	
	/**
	 * @var IdReference
	 */
	public $id;


    /**
     * @var bool
     */
    public $isDeleted;

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
