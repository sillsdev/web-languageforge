<?php

namespace models;

use models\mapper\MongoMapper;

use models\mapper\IdReference;

use models\mapper\Id;
use models\mapper\ArrayOf;

class LanguageModelMongoMapper extends \models\mapper\MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance) {
			$instance = new LanguageModelMongoMapper(LF_DATABASE, 'languages');
		}
		return $instance;
	}
}

class LanguageModel extends \models\mapper\MapperModel
{
	public function __construct($id = '') {
		$this->id = new Id();
		$this->description = new ArrayOf(ArrayOf::VALUE);
		parent::__construct(LanguageModelMongoMapper::instance(), $id);
	}

	/**
	 * @var IdReference
	 */
	public $id;

	/**
	 * @var string
	 */
	public $type;

	/**
	 * @var ArrayOf
	 * ArrayOf<string>
	 */
	public $description;

	/**
	 * @var string
	 */
	public $subtag;

	/**
	 * @var string
	 */
	public $deprecated;

}

class LanguageListModel extends \models\mapper\MapperListModel
{
	public function __construct()
	{
		parent::__construct(
			LanguageModelMongoMapper::instance(),
			array('description' => array('$regex' => '')),
			array('type', 'subtag', 'description', 'deprecated')
		);
	}
}

class LanguageTypeaheadModel extends \models\mapper\MapperListModel
{
	public function __construct($searchTerm)
	{
		parent::__construct(
			LanguageModelMongoMapper::instance(),
			array('description' => array('$regex' => $searchTerm, '$options' => '-i')),
			// Or perhaps array('type' => array('$in' => array('language', 'extlang')))...?
			array('type', 'subtag', 'description', 'deprecated')
		);
	}
}

?>
