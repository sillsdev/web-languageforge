<?php

namespace models\scriptureforge\sfchecks;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\MapperListModel;
use models\mapper\Id;
use models\mapper\IdReference;

class QuestionTemplateListModel extends \models\mapper\MapperListModel
{
	public static function mapper($databaseName) {
		static $instance = null;
		if (null === $instance) {
			$instance = new \models\mapper\MongoMapper($databaseName, 'questionTemplates');
		}
		return $instance;
	}

	public function __construct($projectModel) {
		$databaseName = $projectModel->databaseName();
		parent::__construct(self::mapper($databaseName),
			array(),
			array('title', 'description')
		);
	}
}

?>
