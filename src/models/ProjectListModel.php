<?php

namespace models;

use libraries\shared\palaso\CodeGuard;

use models\shared\rights\ProjectRoles;
use models\shared\rights\ProjectRoleModel;
use models\mapper\MapOf;
use models\mapper\MongoMapper;
use models\mapper\MongoStore;
use models\mapper\ReferenceList;
use models\mapper\Id;

require_once(APPPATH . 'models/ProjectModel.php');

class ProjectListModel extends \models\mapper\MapperListModel
{
	public function __construct()
	{
		parent::__construct(
			ProjectModelMongoMapper::instance(),
			array(),
			array('projectName', 'language')
		);
	}
}


?>