<?php
namespace models;

require_once(APPPATH . '/models/ProjectModel.php');

class FeaturedProjectListModel extends \models\mapper\MapperListModel
{
	public function __construct()
	{
		parent::__construct(
			ProjectModelMongoMapper::instance(),
			array('featured' => true),
			array('projectname', 'language')
		);
	}
}
?>