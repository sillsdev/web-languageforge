<?php

namespace models;

use libraries\palaso\CodeGuard;
use models\rights\Realm;
use models\rights\Roles;
use models\rights\ProjectRoleModel;
use models\mapper\MapOf;
use models\mapper\MongoMapper;
use models\mapper\MongoStore;
use models\mapper\ReferenceList;
use models\mapper\Id;

require_once(APPPATH . '/models/ProjectModel.php');


class ProjectList_UserModel extends \models\mapper\MapperListModel
{

	public function __construct($userId)
	{
		parent::__construct(
				ProjectModelMongoMapper::instance(),
				array('users.' . $userId => array('$exists' => true)),
				array('projectname')
		);
	}

}


?>