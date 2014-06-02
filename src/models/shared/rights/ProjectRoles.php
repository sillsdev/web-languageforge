<?php
namespace models\shared\rights;

use models\shared\rights\RolesBase;

class ProjectRoles extends RolesBase {
	const PROJECT_MANAGER = 'project_manager';
	const MEMBER = 'member';
	const NONE = 'none';
}

?>