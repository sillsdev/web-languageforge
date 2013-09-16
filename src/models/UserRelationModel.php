<?php
namespace models;

use models\mapper\MongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;

class UserRelationModelMongoMapper extends \models\mapper\MongoMapper
{
	public static function instance() {
		static $instance = null;
		if (null === $instance) {
			$instance = new UserRelationModelMongoMapper(SF_DATABASE, 'userrelation');
		}
		return $instance;
	}
}

class UserRelationModel extends \models\mapper\MapperModel
{
	public function __construct($type, $id = '') {
		$this->id = new Id();
		$this->userRef = new IdReference();
		$this->type = $type;
		parent::__construct(UserRelationModelMongoMapper::instance(), $id);
	}
	
	/**
	 * Removes a relation from the collection
	 * @param string $id
	 */
	public static function remove($id) {
		UserRelationModelMongoMapper::instance()->remove($id);
	}

	/**
	 * @var Id
	 */
	public $id;
	
	/**
	 * @var string
	 */
	public $type;
	
	/**
	 * @var IdReference
	 */
	public $userRef;
	
	/**
	 * @var IdReference
	 */
	public $projectRef;
	
}

?>
