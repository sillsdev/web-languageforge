<?php

namespace models;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\MapperListModel;
use models\mapper\Id;
use models\mapper\IdReference;

class QuestionTemplateModelMongoMapper extends \models\mapper\MongoMapper
{
	public static function instance() {
		static $instance = null;
		if (null === $instance) {
			$instance = new QuestionTemplateModelMongoMapper(SF_DATABASE, 'questiontemplates');
		}
		return $instance;
	}
}

class QuestionTemplateModel extends \models\mapper\MapperModel
{
	public function __construct($id = '') {
		$this->id = new Id();
		parent::__construct(QuestionTemplateModelMongoMapper::instance(), $id);
	}

	public function remove() {
		$result = QuestionTemplateModelMongoMapper::instance()->remove($this->id->asString());
		return $result;
	}

	/**
	 * @var IdReference
	 */
	public $id;

	/**
	 * @var string
	 */
	public $title;

	/**
	 * @var string A content description/explanation of the question being asked
	 */
	public $description;
}

class QuestionTemplateListModel extends \models\mapper\MapperListModel
{
	public function __construct() {
		parent::__construct(
			QuestionTemplateModelMongoMapper::instance(),
			array(),
			array('title', 'description')
		);
	}
}

?>
