<?php

namespace models\languageforge\lexicon;

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
		$this->id = new Id();
		$this->lexeme = new MultiText();
		$this->senses = new ArrayOf(
			function($data) {
				return new Sense();
			}
		);
		$this->authorInfo = new AuthorInfo();
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
	 *
	 * @var AuthorInfo
	 */
	 // TODO Renamed $_metadata to $authorInfo, remove this comment when stitched in IJH 2013-11
	public $authorInfo;

	/**
	 * Remove this LexEntry from the collection
	 * @param ProjectModel $projectModel
	 * @param unknown $id
	 */
	public static function remove($projectModel, $id) {
		$databaseName = $projectModel->databaseName();
		LexEntryModelMongoMapper::connect($databaseName)->remove($id);
	}

}


?>
