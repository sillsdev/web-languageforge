<?php
namespace models;

use models\mapper\MongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;

class UserRelationModel extends \models\mapper\MapperModel
{
	public static function mapper() {
		static $instance = null;
		if (null === $instance) {
			$instance = new \models\mapper\MongoMapper(SF_DATABASE, 'userrelation');
		}
		return $instance;
	}
	
	public function __construct($type, $userId, $projectId) {
		$this->id = new Id();
		$this->type = $type;
		$this->userRef = new IdReference($userId);
		$this->projectRef = new IdReference($projectId);
		parent::__construct(self::mapper(), '');
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
