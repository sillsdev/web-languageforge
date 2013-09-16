<?php

namespace models;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\MapperListModel;
use models\mapper\Id;
use models\mapper\IdReference;

class FavoriteModelMongoMapper extends \models\mapper\MongoMapper
{
	public static function instance() {
		static $instance = null;
		if (null === $instance) {
			$instance = new FavoriteModelMongoMapper(SF_DATABASE, 'favorites');
		}
		return $instance;
	}
}

class FavoriteModel extends \models\mapper\MapperModel
{
	public function __construct($id = '') {
		$this->id = new Id();
		parent::__construct(FavoriteModelMongoMapper::instance(), $id);
	}

	public function remove() {
		$result = FavoriteModelMongoMapper::instance()->remove($this->id->asString());
		return $result;
	}

	/**
	 * @var IdReference
	 */
	public $id;

	/**
	 * @var string
	 */
	public $username;

	/**
	 * @var string
	 */
	public $title;

	/**
	 * @var string A content description/explanation of the question being asked
	 */
	public $description;
}

class FavoriteListModel extends \models\mapper\MapperListModel
{
	public function __construct($username) {
		parent::__construct(
			FavoriteModelMongoMapper::instance(),
			array('username' => array('$regex' => $username)),
			array('username', 'title', 'description')
		);
	}
}

?>
