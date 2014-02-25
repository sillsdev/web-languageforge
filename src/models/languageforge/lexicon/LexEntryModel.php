<?php

namespace models\languageforge\lexicon;

use models\CommentModel;

use models\mapper\Id;
use models\mapper\ArrayOf;
use models\ProjectModel;

class LexEntryModelMongoMapper extends \models\mapper\MongoMapper {

	/**
	 * @var LexEntryModelMongoMapper[]
	 */
	private static $_pool = array();
	
	/**
	 * @param string $databaseName
	 * @return LexEntryModelMongoMapper
	 */
	public static function connect($databaseName) {
		if (!isset(static::$_pool[$databaseName])) {
			static::$_pool[$databaseName] = new LexEntryModelMongoMapper($databaseName, 'lexicon');
		}
		return static::$_pool[$databaseName];
	}
	
}

class LexEntryModel extends \models\mapper\MapperModel {

	/**
	 * @param ProjectModel $projectModel
	 * @param string $id
	 */
	public function __construct($projectModel, $id = '') {
		$this->id = new Id();
		$this->_projectModel = $projectModel;
		$this->lexeme = new MultiText();
		$this->lexemeComments = new ArrayOf(
			function($data) {
				return new CommentModel();
			}
		);
		$this->senses = new ArrayOf(
			function($data) {
				return new Sense();
			}
		);
		$this->authorInfo = new AuthorInfo();
		$databaseName = $projectModel->databaseName();
		parent::__construct(LexEntryModelMongoMapper::connect($databaseName), $id);
	}
	
	/**
	 * @var IdReference
	 */
	public $id;
	
	// TODO Enhance. Add $guid also.  All Lift entries have a guid and we need to have this to do S/R correctly. CP 2013-12
	
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
	 * 
	 * @var ArrayOf<CommentModel>
	 */
	public $lexemeComments;

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
	 * @var ProjectModel;
	 */
	private $_projectModel;
	
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

class LexEntryListModel extends \models\mapper\MapperListModel {

	public function __construct($projectModel) {
		parent::__construct(
				LexEntryModelMongoMapper::connect($projectModel->databaseName()),
				array(),
				array('lexeme', 'senses')
		);
	}

}

?>
